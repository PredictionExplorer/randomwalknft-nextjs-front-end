import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const MOCK_PORT = 3900;

if (process.env.FORCE_COLOR && process.env.NO_COLOR) {
  delete process.env.NO_COLOR;
}

/**
 * By default the app under test talks to a deterministic mock of the Go API, the
 * asset host, and the Arbitrum RPC (tests/e2e/mock-upstream). Set `E2E_UPSTREAM=live`
 * to run the same suite against the real services instead (smoke runs only; live
 * data makes visual baselines and exact assertions impossible).
 */
const live = process.env.E2E_UPSTREAM === "live";
const mockOrigin = `http://127.0.0.1:${MOCK_PORT}`;

/** Required for `next build` / `next start` (NEXT_PUBLIC_* are inlined at build time). */
const webServerEnv = {
  NEXT_PUBLIC_NETWORK: process.env.NEXT_PUBLIC_NETWORK ?? "mainnet",
  NEXT_PUBLIC_API_BASE_URL: live
    ? (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://randomwalknft-api.com")
    : mockOrigin,
  NEXT_PUBLIC_RPC_URL: live ? (process.env.NEXT_PUBLIC_RPC_URL ?? "https://arb1.arbitrum.io/rpc") : `${mockOrigin}/rpc`,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? "https://randomwalknft.com",
  NEXT_PUBLIC_NFT_ADDRESS: process.env.NEXT_PUBLIC_NFT_ADDRESS ?? "0x895a6F444BE4ba9d124F61DF736605792B35D66b",
  // Rotation lists would override the singular URLs above; keep the run hermetic.
  NEXT_PUBLIC_API_URLS: "",
  NEXT_PUBLIC_RPC_URLS: ""
};

const appServer = {
  command: `corepack pnpm build && corepack pnpm exec next start --hostname 127.0.0.1 --port ${PORT}`,
  port: PORT,
  reuseExistingServer: !process.env.CI,
  timeout: 180_000,
  env: { ...process.env, ...webServerEnv }
};

const mockServer = {
  command: `node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON tests/e2e/mock-upstream/server.ts`,
  port: MOCK_PORT,
  reuseExistingServer: !process.env.CI,
  timeout: 30_000,
  env: { ...process.env, MOCK_UPSTREAM_PORT: String(MOCK_PORT) }
};

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["html"], ["list"]] : [["list"]],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  webServer: live ? [appServer] : [mockServer, appServer],
  projects: [
    {
      name: "chromium",
      testIgnore: /wallet-mobile\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] }
    },
    // Transaction flows mutate the shared mock world, so they run in one engine only;
    // the wallet mock itself is engine-agnostic and still runs everywhere.
    {
      name: "firefox",
      testIgnore: /(wallet-mobile|visual|flows)\.spec\.ts/,
      use: { ...devices["Desktop Firefox"] }
    },
    {
      name: "webkit",
      testIgnore: /(wallet-mobile|visual|flows)\.spec\.ts/,
      use: { ...devices["Desktop Safari"] }
    },
    {
      name: "mobile-chromium",
      testMatch: /wallet-mobile\.spec\.ts/,
      use: { ...devices["Pixel 7"] }
    },
    {
      name: "mobile-webkit",
      testMatch: /wallet-mobile\.spec\.ts/,
      use: { ...devices["iPhone 13"] }
    }
  ]
});
