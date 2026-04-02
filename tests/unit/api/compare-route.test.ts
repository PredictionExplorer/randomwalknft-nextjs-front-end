// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchBeautyComparePairIds = vi.fn();
const getVoteCount = vi.fn();
const fetchRankingSignChallenge = vi.fn();

vi.mock("@/lib/api/public", () => ({
  fetchBeautyComparePairIds,
  getVoteCount,
  fetchRankingSignChallenge
}));

vi.mock("@/lib/config", () => ({
  getBaseConfig: () => ({ API_BASE_URL: "http://api.test" })
}));

describe("compare route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns compare data on GET", async () => {
    fetchBeautyComparePairIds.mockResolvedValue({
      token_ids: [10, 12],
      pair_exhausted: false
    });
    getVoteCount.mockResolvedValue(99);
    fetchRankingSignChallenge.mockResolvedValue({ nonce: "deadbeef" });
    const { GET } = await import("@/app/api/compare/route");

    const response = await GET(new Request("http://localhost/api/compare"));
    await expect(response.json()).resolves.toEqual({
      tokenIds: [10, 12],
      totalCount: 99,
      signNonce: "deadbeef",
      pairExhausted: false
    });
    expect(fetchBeautyComparePairIds).toHaveBeenCalledWith(undefined, { skipPairFilter: false });
  });

  it("rejects invalid vote payloads", async () => {
    const { POST } = await import("@/app/api/compare/route");

    const response = await POST(
      new Request("http://localhost/api/compare", {
        method: "POST",
        body: JSON.stringify({ firstId: 1 })
      })
    );

    expect(response.status).toBe(400);
  });

  it("submits a valid vote payload to upstream add_game", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ result: "success" })
    });
    vi.stubGlobal("fetch", fetchMock);

    const { POST } = await import("@/app/api/compare/route");

    const response = await POST(
      new Request("http://localhost/api/compare", {
        method: "POST",
        body: JSON.stringify({
          firstId: 1,
          secondId: 2,
          winner: 2,
          signNonce: "n1",
          signature: "0x" + "ab".repeat(65),
          chainId: 31337
        })
      })
    );

    await expect(response.json()).resolves.toEqual({ result: "success" });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://api.test/add_game",
      expect.objectContaining({
        method: "POST"
      })
    );
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual({
      nft1: 1,
      nft2: 2,
      nft1_win: 0,
      sign_nonce: "n1",
      signature: "0x" + "ab".repeat(65),
      chain_id: 31337
    });

    vi.unstubAllGlobals();
  });
});
