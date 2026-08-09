// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const { readContract } = vi.hoisted(() => ({
  readContract: vi.fn()
}));

vi.mock("@/lib/web3/public-client", () => ({
  publicClient: { readContract }
}));

function mockTotalSupply(totalSupply: bigint) {
  readContract.mockImplementation(({ functionName }: { functionName: string }) => {
    if (functionName === "totalSupply") {
      return Promise.resolve(totalSupply);
    }
    return Promise.reject(new Error(`Unexpected contract read: ${functionName}`));
  });
}

describe("getRandomMintedTokenIds", () => {
  beforeEach(() => {
    vi.resetModules();
    readContract.mockReset();
  });

  it("samples unique token ids within the minted range", async () => {
    mockTotalSupply(5_000n);

    const { getRandomMintedTokenIds } = await import("@/lib/api/public");

    const ids = await getRandomMintedTokenIds(12);

    expect(ids).toHaveLength(12);
    expect(new Set(ids).size).toBe(12);
    for (const id of ids) {
      expect(id).toBeGreaterThanOrEqual(0);
      expect(id).toBeLessThan(5_000);
    }
  });

  it("clamps the sample when fewer tokens are minted than requested", async () => {
    mockTotalSupply(3n);

    const { getRandomMintedTokenIds } = await import("@/lib/api/public");

    const ids = await getRandomMintedTokenIds(12);

    expect([...ids].sort((a, b) => a - b)).toEqual([0, 1, 2]);
  });

  it("returns an empty pool when no tokens are minted", async () => {
    mockTotalSupply(0n);

    const { getRandomMintedTokenIds } = await import("@/lib/api/public");

    await expect(getRandomMintedTokenIds(12)).resolves.toEqual([]);
  });

  it("returns an empty pool when the supply read fails", async () => {
    readContract.mockRejectedValue(new Error("RPC unavailable"));

    const { getRandomMintedTokenIds } = await import("@/lib/api/public");

    await expect(getRandomMintedTokenIds(12)).resolves.toEqual([]);
  });
});
