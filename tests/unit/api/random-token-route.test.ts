// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const getRandomTokenIds = vi.fn();

vi.mock("@/lib/api/public", () => ({
  getRandomTokenIds
}));

describe("random-token route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns token ids from the upstream data layer", async () => {
    getRandomTokenIds.mockResolvedValue([7, 11, 42]);
    const { GET } = await import("@/app/api/random-token/route");

    const response = await GET();
    await expect(response.json()).resolves.toEqual({ tokenIds: [7, 11, 42] });
  });
});
