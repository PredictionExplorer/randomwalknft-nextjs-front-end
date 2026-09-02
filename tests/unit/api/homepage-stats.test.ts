// @vitest-environment node

import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { server } from "../../setup/msw/server";

const API_BASE_URL = "https://api.test.example.com";
const LAST_MINTER = "0xDBEA05b33c13b7d13934B22B2929B261B8E656fC";
const { readContract } = vi.hoisted(() => ({
  readContract: vi.fn()
}));

vi.mock("@/lib/web3/public-client", () => ({
  publicClient: { readContract }
}));

function mockHomepageContracts(totalSupply: bigint, mintPrice = 10_000_000_000_000_000n) {
  readContract.mockImplementation(({ functionName }: { functionName: string }) => {
    switch (functionName) {
      case "totalSupply":
        return Promise.resolve(totalSupply);
      case "getMintPrice":
        return Promise.resolve(mintPrice);
      case "withdrawalAmount":
        return Promise.resolve(4_000_000_000_000_000_000n);
      case "timeUntilWithdrawal":
        return Promise.resolve(1_000_000n);
      case "lastMinter":
        return Promise.resolve(LAST_MINTER);
      case "numWithdrawals":
        return Promise.resolve(0n);
      default:
        return Promise.reject(new Error(`Unexpected contract read: ${functionName}`));
    }
  });
}

function mockRatingOrder(ids: number[]) {
  server.use(http.get(`${API_BASE_URL}/api/randomwalk/rating_order`, () => HttpResponse.json(ids)));
}

describe("getHomepageStats", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-06-25T12:00:00.000Z"));
    readContract.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("builds a 15-token daily featured pool from totalSupply", async () => {
    let exploreRandomCalled = false;
    mockHomepageContracts(20n);
    mockRatingOrder([]);
    server.use(
      http.get(`${API_BASE_URL}/api/randomwalk/explore/random`, () => {
        exploreRandomCalled = true;
        return HttpResponse.json([0, 1, 2]);
      })
    );

    const { getHomepageStats } = await import("@/lib/api/public");

    const stats = await getHomepageStats();

    expect(stats).toMatchObject({
      mintedCount: 20,
      mintPrice: 0.01,
      featuredTokenIds: [10, 15, 11, 8, 4, 14, 6, 17, 3, 13, 9, 12, 5, 16, 18]
    });
    expect(exploreRandomCalled).toBe(false);
  });

  it("exposes the live vault state alongside wall rows", async () => {
    mockHomepageContracts(20n);
    // rating_order is worst-first; the best works sit at the end.
    mockRatingOrder([7, 2, 11, 4]);

    const { getHomepageStats } = await import("@/lib/api/public");

    const stats = await getHomepageStats();

    expect(stats.vault).toMatchObject({
      prizeEth: 4,
      secondsUntilWithdrawal: 1_000_000,
      lastMinter: LAST_MINTER,
      mintPriceEth: 0.01,
      mintedCount: 20,
      numWithdrawals: 0
    });
    expect(stats.beautyTopIds).toEqual([4, 11, 2, 7]);
    expect(stats.newestIds).toEqual([19, 18, 17, 16, 15, 14, 13, 12]);
  });

  it("returns a smaller daily pool when fewer than 15 NFTs are minted", async () => {
    mockHomepageContracts(2n);
    mockRatingOrder([]);

    const { getHomepageStats } = await import("@/lib/api/public");

    const stats = await getHomepageStats();

    expect(stats.featuredTokenIds).toHaveLength(2);
    expect(new Set(stats.featuredTokenIds).size).toBe(2);
    for (const id of stats.featuredTokenIds) {
      expect(id).toBeGreaterThanOrEqual(0);
      expect(id).toBeLessThan(2);
    }
  });

  it("keeps homepage stats safe when supply reads fail", async () => {
    readContract.mockImplementation(({ functionName }: { functionName: string }) => {
      if (functionName === "totalSupply") {
        return Promise.reject(new Error("RPC unavailable"));
      }
      return Promise.resolve(10_000_000_000_000_000n);
    });
    mockRatingOrder([]);

    const { getHomepageStats } = await import("@/lib/api/public");

    const stats = await getHomepageStats();
    expect(stats.mintedCount).toBe(0);
    expect(stats.mintPrice).toBeUndefined();
    expect(stats.featuredTokenIds).toEqual([]);
    expect(stats.vault).toBeNull();
  });
});
