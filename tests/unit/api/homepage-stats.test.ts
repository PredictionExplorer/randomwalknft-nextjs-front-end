// @vitest-environment node

import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { server } from "../../setup/msw/server";

const API_BASE_URL = "https://api.test.example.com";
const { readContract } = vi.hoisted(() => ({
  readContract: vi.fn()
}));

vi.mock("@/lib/web3/public-client", () => ({
  publicClient: { readContract }
}));

function mockHomepageContracts(totalSupply: bigint, mintPrice = 10_000_000_000_000_000n) {
  readContract.mockImplementation(({ functionName }: { functionName: string }) => {
    if (functionName === "totalSupply") {
      return Promise.resolve(totalSupply);
    }
    if (functionName === "getMintPrice") {
      return Promise.resolve(mintPrice);
    }
    return Promise.reject(new Error(`Unexpected contract read: ${functionName}`));
  });
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

  it("returns a smaller daily pool when fewer than 15 NFTs are minted", async () => {
    mockHomepageContracts(2n);

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
      if (functionName === "getMintPrice") {
        return Promise.resolve(10_000_000_000_000_000n);
      }
      return Promise.reject(new Error(`Unexpected contract read: ${functionName}`));
    });

    const { getHomepageStats } = await import("@/lib/api/public");

    await expect(getHomepageStats()).resolves.toMatchObject({
      mintedCount: 0,
      mintPrice: 0.01,
      featuredTokenIds: []
    });
  });
});
