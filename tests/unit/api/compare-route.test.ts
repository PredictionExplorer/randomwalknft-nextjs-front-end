// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const getRandomPair = vi.fn();
const getVoteCount = vi.fn();
const submitBeautyVote = vi.fn();

vi.mock("@/lib/api/public", () => ({
  getRandomPair,
  getVoteCount,
  submitBeautyVote
}));

describe("compare route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns compare data on GET", async () => {
    getRandomPair.mockResolvedValue([10, 12]);
    getVoteCount.mockResolvedValue(99);
    const { GET } = await import("@/app/api/compare/route");

    const response = await GET();
    await expect(response.json()).resolves.toEqual({
      tokenIds: [10, 12],
      totalCount: 99
    });
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

  it("submits a valid vote payload", async () => {
    submitBeautyVote.mockResolvedValue({ result: "success" });
    const { POST } = await import("@/app/api/compare/route");

    const response = await POST(
      new Request("http://localhost/api/compare", {
        method: "POST",
        body: JSON.stringify({ firstId: 1, secondId: 2, winner: 2 })
      })
    );

    await expect(response.json()).resolves.toEqual({ result: "success" });
    expect(submitBeautyVote).toHaveBeenCalledWith(1, 2, 2);
  });
});
