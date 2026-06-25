import { afterEach, describe, expect, it } from "vitest";

import { getMissingEnvKeys, isEnvConfigured, REQUIRED_ENV_KEYS } from "@/lib/env";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("env helpers", () => {
  it("reports no missing keys when the public env is valid", () => {
    process.env.NEXT_PUBLIC_NETWORK = "mainnet";
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
    process.env.NEXT_PUBLIC_RPC_URL = "https://rpc.example.com";
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";

    expect(getMissingEnvKeys()).toEqual([]);
    expect(isEnvConfigured()).toBe(true);
  });

  it("reports empty required public env keys", () => {
    for (const key of REQUIRED_ENV_KEYS) {
      process.env[key] = "";
    }

    expect(getMissingEnvKeys()).toEqual([...REQUIRED_ENV_KEYS]);
    expect(isEnvConfigured()).toBe(false);
  });

  it("treats unsupported networks as a network configuration error", () => {
    process.env.NEXT_PUBLIC_NETWORK = "unsupported";
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com";
    process.env.NEXT_PUBLIC_RPC_URL = "https://rpc.example.com";
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";

    expect(getMissingEnvKeys()).toEqual(["NEXT_PUBLIC_NETWORK"]);
  });
});
