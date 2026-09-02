// @vitest-environment node

import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { server } from "../../setup/msw/server";

const API_BASE_URL = "https://api.test.example.com";
const LAST_MINTER = "0xDBEA05b33c13b7d13934B22B2929B261B8E656fC";

const { client } = vi.hoisted(() => {
  const mockClient = {
    chain: { contracts: { multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" } } } as unknown,
    multicall: vi.fn<(parameters: unknown) => Promise<unknown[]>>(),
    readContract: vi.fn<(parameters: { functionName: string }) => Promise<unknown>>()
  };
  return { client: mockClient };
});

vi.mock("@/lib/web3/public-client", () => ({
  getPublicClient: () => client
}));

function mockContractsEndpoint() {
  server.use(
    http.get(`${API_BASE_URL}/api/randomwalk/contracts`, () =>
      HttpResponse.json({
        status: 1,
        marketplace_addr: "0x0000000000000000000000000000000000000001",
        randomwalk_addr: "0x895a6F444BE4ba9d124F61DF736605792B35D66b"
      })
    )
  );
}

describe("getVaultState", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-09-02T12:00:00.000Z"));
    client.multicall.mockReset();
    client.readContract.mockReset();
    client.chain = { contracts: { multicall3: { address: "0xcA11bde05977b3631167028862bE2a173976CA11" } } };
    mockContractsEndpoint();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("reads the whole vault in one Multicall3 round-trip and keeps exact wei alongside display numbers", async () => {
    client.multicall.mockResolvedValue([
      { status: "success", result: 4097n },
      { status: "success", result: 40_680_000_000_000_000_000n },
      { status: "success", result: 2_386_000n },
      { status: "success", result: LAST_MINTER },
      { status: "success", result: 90_500_000_000_000_000n },
      { status: "success", result: 0n },
      { status: "success", result: 1_754_000_000n }
    ]);
    const { getVaultState } = await import("@/lib/api/public");

    const vault = await getVaultState();

    expect(client.multicall).toHaveBeenCalledTimes(1);
    expect(client.readContract).not.toHaveBeenCalled();
    expect(vault).toMatchObject({
      mintedCount: 4097,
      prizeEth: 40.68,
      prizeWei: "40680000000000000000",
      secondsUntilWithdrawal: 2_386_000,
      lastMinter: LAST_MINTER,
      mintPriceEth: 0.0905,
      mintPriceWei: "90500000000000000",
      numWithdrawals: 0,
      lastMintAtMs: 1_754_000_000_000,
      readAtMs: Date.now()
    });
  });

  it("degrades optional fields when individual calls fail but the supply read succeeds", async () => {
    client.multicall.mockResolvedValue([
      { status: "success", result: 12n },
      { status: "failure", error: new Error("revert") },
      { status: "failure", error: new Error("revert") },
      { status: "success", result: "0x0000000000000000000000000000000000000000" },
      { status: "failure", error: new Error("revert") },
      { status: "failure", error: new Error("revert") },
      { status: "failure", error: new Error("revert") }
    ]);
    const { getVaultState } = await import("@/lib/api/public");

    const vault = await getVaultState();

    expect(vault).toMatchObject({
      mintedCount: 12,
      prizeEth: 0,
      prizeWei: "0",
      secondsUntilWithdrawal: 0,
      numWithdrawals: 0
    });
    expect(vault?.lastMinter).toBeUndefined();
    expect(vault?.mintPriceEth).toBeUndefined();
    expect(vault?.lastMintAtMs).toBeUndefined();
  });

  it("returns null when the supply read itself fails", async () => {
    client.multicall.mockResolvedValue([{ status: "failure", error: new Error("rpc down") }]);
    const { getVaultState } = await import("@/lib/api/public");

    await expect(getVaultState()).resolves.toBeNull();
  });

  it("falls back to individual reads on networks without Multicall3", async () => {
    client.chain = { contracts: undefined };
    const answers: Record<string, unknown> = {
      totalSupply: 3n,
      withdrawalAmount: 1_000_000_000_000_000_000n,
      lastMinter: LAST_MINTER
    };
    client.readContract.mockImplementation(({ functionName }: { functionName: string }): Promise<unknown> =>
      functionName in answers ? Promise.resolve(answers[functionName]) : Promise.reject(new Error("not deployed"))
    );
    const { getVaultState } = await import("@/lib/api/public");

    const vault = await getVaultState();

    expect(client.multicall).not.toHaveBeenCalled();
    expect(vault).toMatchObject({ mintedCount: 3, prizeEth: 1, lastMinter: LAST_MINTER, secondsUntilWithdrawal: 0 });
  });
});
