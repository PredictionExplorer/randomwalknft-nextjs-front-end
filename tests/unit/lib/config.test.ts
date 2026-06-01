// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function stubRequiredEnv() {
  vi.stubEnv("NEXT_PUBLIC_NETWORK", "mainnet");
  vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.test.example.com");
  vi.stubEnv("NEXT_PUBLIC_RPC_URL", "https://arb1.arbitrum.io/rpc");
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://randomwalknft.com/");
}

describe("getBaseConfig", () => {
  beforeEach(() => {
    vi.resetModules();
    stubRequiredEnv();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses NEXT_PUBLIC_SITE_URL as the normalized canonical origin", async () => {
    const { getBaseConfig } = await import("@/lib/config");

    expect(getBaseConfig().SITE_URL).toBe("https://randomwalknft.com");
  });
});
