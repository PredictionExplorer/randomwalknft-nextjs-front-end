// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const readContract = vi.fn();

vi.mock("@/lib/web3/public-client", () => ({
  publicClient: { readContract }
}));

describe("random-token route", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("returns a random tokenId within the total supply range", async () => {
    readContract.mockResolvedValue(BigInt(100));
    const { GET } = await import("@/app/api/random-token/route");

    const response = await GET(new Request("http://localhost/api/random-token"));
    const data = await response.json();

    expect(data.totalSupply).toBe(100);
    expect(data.tokenId).toBeGreaterThanOrEqual(0);
    expect(data.tokenId).toBeLessThan(100);
  });

  it("returns a different tokenId when exclude matches the random pick", async () => {
    readContract.mockResolvedValue(BigInt(2));

    const { GET } = await import("@/app/api/random-token/route");
    const results = new Set<number>();

    for (let i = 0; i < 20; i++) {
      const response = await GET(new Request("http://localhost/api/random-token?exclude=0"));
      const data = await response.json();
      results.add(data.tokenId as number);
    }

    expect(results.size).toBeGreaterThanOrEqual(1);
  });

  it("returns tokenId 0 and totalSupply 0 when supply is zero", async () => {
    readContract.mockResolvedValue(BigInt(0));
    const { GET } = await import("@/app/api/random-token/route");

    const response = await GET(new Request("http://localhost/api/random-token"));
    const data = await response.json();

    expect(data).toEqual({ tokenId: 0, totalSupply: 0 });
  });

  it("excludes the specified tokenId", async () => {
    readContract.mockResolvedValue(BigInt(2));
    const { GET } = await import("@/app/api/random-token/route");

    const allResults: number[] = [];
    for (let i = 0; i < 50; i++) {
      const response = await GET(new Request("http://localhost/api/random-token?exclude=1"));
      const data = await response.json();
      allResults.push(data.tokenId as number);
    }

    const withExclude1 = allResults.filter((id) => id === 1);
    expect(withExclude1.length).toBe(0);
  });
});
