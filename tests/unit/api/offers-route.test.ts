// @vitest-environment node

import type { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getOffers = vi.fn();

vi.mock("@/lib/api/public", () => ({
  getOffers
}));

describe("offers route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unfiltered offers when no account is provided", async () => {
    getOffers
      .mockResolvedValueOnce([{ buyer: "0x1", seller: "0x2", offerId: 1 }])
      .mockResolvedValueOnce([{ buyer: "0x3", seller: "0x4", offerId: 2 }]);
    const { GET } = await import("@/app/api/offers/route");

    const response = await GET({
      nextUrl: new URL("http://localhost/api/offers")
    } as NextRequest);
    await expect(response.json()).resolves.toEqual({
      buyOffers: [{ buyer: "0x1", seller: "0x2", offerId: 1 }],
      sellOffers: [{ buyer: "0x3", seller: "0x4", offerId: 2 }]
    });
  });

  it("filters offers for a specific account", async () => {
    getOffers
      .mockResolvedValueOnce([
        { buyer: "0xabc", seller: "0x2", offerId: 1 },
        { buyer: "0xdef", seller: "0x3", offerId: 2 }
      ])
      .mockResolvedValueOnce([
        { buyer: "0x4", seller: "0xabc", offerId: 3 },
        { buyer: "0x5", seller: "0xdef", offerId: 4 }
      ]);
    const { GET } = await import("@/app/api/offers/route");

    const response = await GET({
      nextUrl: new URL("http://localhost/api/offers?account=0xAbC")
    } as NextRequest);

    await expect(response.json()).resolves.toEqual({
      buyOffers: [{ buyer: "0xabc", seller: "0x2", offerId: 1 }],
      sellOffers: [{ buyer: "0x4", seller: "0xabc", offerId: 3 }]
    });
  });
});
