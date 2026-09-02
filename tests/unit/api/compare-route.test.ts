// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const { fetchBeautyComparePairIds, fetchRankingSignChallenge, getVoteCount, submitBeautyVote } = vi.hoisted(() => ({
  fetchBeautyComparePairIds: vi.fn(),
  fetchRankingSignChallenge: vi.fn(),
  getVoteCount: vi.fn(),
  submitBeautyVote: vi.fn()
}));

vi.mock("@/lib/api/public", () => ({
  fetchBeautyComparePairIds,
  getVoteCount,
  fetchRankingSignChallenge,
  submitBeautyVote
}));

import { UpstreamHttpError } from "@/lib/api/client";
import { __resetRateLimits } from "@/lib/server/rate-limit";

const VALID_VOTE = {
  firstId: 1,
  secondId: 2,
  winner: 2,
  signNonce: "n1",
  signature: "0x" + "ab".repeat(65),
  chainId: 31337
};

function post(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/compare", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body)
  });
}

describe("compare route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    __resetRateLimits();
    fetchBeautyComparePairIds.mockResolvedValue({ token_ids: [10, 12], pair_exhausted: false });
    getVoteCount.mockResolvedValue(99);
    fetchRankingSignChallenge.mockResolvedValue({ nonce: "deadbeef" });
  });

  it("returns compare data on GET", async () => {
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

  it("passes a checksummed voter through and rejects malformed addresses", async () => {
    const { GET } = await import("@/app/api/compare/route");
    const voter = "0x1234567890abcdef1234567890abcdef12345678";

    await GET(new Request(`http://localhost/api/compare?voter=${voter}&skip_pair_filter=1`));
    expect(fetchBeautyComparePairIds).toHaveBeenCalledWith(voter, { skipPairFilter: true });

    const bad = await GET(new Request("http://localhost/api/compare?voter=not-an-address"));
    expect(bad.status).toBe(400);
  });

  it("answers 503 when the ranking backend is unreachable", async () => {
    fetchRankingSignChallenge.mockRejectedValue(new TypeError("fetch failed"));
    const { GET } = await import("@/app/api/compare/route");

    const response = await GET(new Request("http://localhost/api/compare"));
    expect(response.status).toBe(503);
  });

  it("rejects invalid vote payloads and impossible winners", async () => {
    const { POST } = await import("@/app/api/compare/route");

    expect((await POST(post({ firstId: 1 }))).status).toBe(400);
    expect((await POST(post("{not json"))).status).toBe(400);
    expect((await POST(post({ ...VALID_VOTE, winner: 7 }))).status).toBe(400);
    expect((await POST(post({ ...VALID_VOTE, secondId: 1 }))).status).toBe(400);
    expect(submitBeautyVote).not.toHaveBeenCalled();
  });

  it("refuses oversized bodies before parsing them", async () => {
    const { POST } = await import("@/app/api/compare/route");

    const response = await POST(post(VALID_VOTE, { "content-length": "100000" }));
    expect(response.status).toBe(413);
  });

  it("submits a valid vote through the shared client", async () => {
    submitBeautyVote.mockResolvedValue({ result: "success" });
    const { POST } = await import("@/app/api/compare/route");

    const response = await POST(post(VALID_VOTE));

    await expect(response.json()).resolves.toEqual({ result: "success" });
    expect(submitBeautyVote).toHaveBeenCalledWith(VALID_VOTE);
  });

  it("forwards a 409 'already voted' with only the backend's error string", async () => {
    submitBeautyVote.mockRejectedValue(
      new UpstreamHttpError(409, "Conflict", { error: "already voted", stack: "internal detail" })
    );
    const { POST } = await import("@/app/api/compare/route");

    const response = await POST(post(VALID_VOTE));
    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({ error: "already voted" });
  });

  it("maps upstream 5xx to a generic 502 and connection failures to 503", async () => {
    const { POST } = await import("@/app/api/compare/route");

    submitBeautyVote.mockRejectedValueOnce(new UpstreamHttpError(500, "Internal", "<html>trace</html>"));
    const failed = await POST(post(VALID_VOTE));
    expect(failed.status).toBe(502);
    await expect(failed.json()).resolves.toEqual({ error: "Vote failed." });

    submitBeautyVote.mockRejectedValueOnce(new TypeError("fetch failed"));
    const unreachable = await POST(post(VALID_VOTE));
    expect(unreachable.status).toBe(503);
  });

  it("rate limits bursts of votes per client", async () => {
    submitBeautyVote.mockResolvedValue({ result: "success" });
    const { POST } = await import("@/app/api/compare/route");

    let lastStatus = 200;
    for (let index = 0; index < 31; index += 1) {
      lastStatus = (await POST(post(VALID_VOTE, { "x-forwarded-for": "203.0.113.9" }))).status;
    }
    expect(lastStatus).toBe(429);

    const other = await POST(post(VALID_VOTE, { "x-forwarded-for": "203.0.113.10" }));
    expect(other.status).toBe(200);
  });
});
