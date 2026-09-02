// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { VaultState } from "@/lib/types";

const { getVaultState } = vi.hoisted(() => ({ getVaultState: vi.fn() }));

vi.mock("@/lib/api/public", () => ({ getVaultState }));
vi.mock("@/lib/server/app-config", () => ({
  getAppConfig: () =>
    Promise.resolve({
      NFT_ADDRESS: "0x895a6F444BE4ba9d124F61DF736605792B35D66b",
      SITE_DESCRIPTION: "Generative art drawn by chance.",
      SITE_NAME: "Random Walk NFT",
      SITE_URL: "https://randomwalknft.com"
    })
}));

const vault: VaultState = {
  prizeEth: 40.68,
  prizeWei: "40680000000000000000",
  secondsUntilWithdrawal: 86_400 * 27,
  lastMinter: "0xB2251e8fd8EbaA3882b5D121a29Db228A1a450eC",
  mintPriceEth: 0.0905,
  mintedCount: 4097,
  numWithdrawals: 0,
  readAtMs: 1_700_000_000_000
};

describe("/api/vault", () => {
  beforeEach(() => {
    vi.resetModules();
    getVaultState.mockReset();
  });

  it("returns the vault with short CDN caching", async () => {
    getVaultState.mockResolvedValue(vault);
    const { GET } = await import("@/app/api/vault/route");
    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("s-maxage=30");
    expect(await response.json()).toMatchObject({ prizeEth: 40.68, mintedCount: 4097 });
  });

  it("answers 503 when the chain read failed", async () => {
    getVaultState.mockResolvedValue(null);
    const { GET } = await import("@/app/api/vault/route");
    const response = await GET();
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "vault_unavailable" });
  });
});

describe("llms.txt routes", () => {
  beforeEach(() => {
    vi.resetModules();
    getVaultState.mockReset();
  });

  it("publishes the short guide with live facts when the vault is readable", async () => {
    getVaultState.mockResolvedValue(vault);
    const { GET } = await import("@/app/llms.txt/route");
    const response = await GET();
    const text = await response.text();

    expect(response.headers.get("content-type")).toMatch(/text\/plain/);
    expect(text).toContain("# Random Walk NFT");
    expect(text).toContain("Works minted: 4,097");
    expect(text).toContain("Vault prize (claimable by last minter): 40.68 ETH");
    expect(text).toContain("0x895a6F444BE4ba9d124F61DF736605792B35D66b");
  });

  it("still publishes the guide without live facts when the chain is down", async () => {
    getVaultState.mockRejectedValue(new Error("rpc"));
    const { GET } = await import("@/app/llms.txt/route");
    const text = await (await GET()).text();
    expect(text).toContain("# Random Walk NFT");
    expect(text).not.toContain("## Live State");
  });

  it("publishes the full guide with the FAQ and charter", async () => {
    getVaultState.mockResolvedValue(vault);
    const { GET } = await import("@/app/llms-full.txt/route");
    const text = await (await GET()).text();

    expect(text).toContain("What is Random Walk NFT?");
    expect(text).toContain("The rules can never change");
    expect(text.length).toBeGreaterThan(5_000);
  });
});
