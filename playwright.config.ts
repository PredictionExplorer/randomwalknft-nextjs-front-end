import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

/** Required for `next build` / `next start` (NEXT_PUBLIC_* are inlined at build time). */
const webServerEnv = {
  NEXT_PUBLIC_NETWORK: "mainnet",
  NEXT_PUBLIC_API_BASE_URL: "https://api.test.example.com",
  NEXT_PUBLIC_RPC_URL: "https://arb1.arbitrum.io/rpc",
  NEXT_PUBLIC_SITE_URL: `http://127.0.0.1:${PORT}`
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
  webServer: {
    command: "pnpm build && pnpm exec next start --hostname 127.0.0.1 --port 3100",
    port: PORT,
    reuseExistingServer: !process.env.CI,
    timeout: 180000,
    env: { ...process.env, ...webServerEnv }
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] }
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] }
    }
  ]
});
