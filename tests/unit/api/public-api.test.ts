// @vitest-environment node

import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { getConfig } from "@/lib/config";
import { getOffers } from "@/lib/api/public";
import { server } from "../../setup/msw/server";

const { MARKET_ADDRESS, NFT_ADDRESS, RWALK_BASE_URL } = getConfig();

describe("public api normalization", () => {
  it("normalizes and sorts offers", async () => {
    server.use(
      http.get(`${RWALK_BASE_URL}/current_offers/${NFT_ADDRESS}/${MARKET_ADDRESS}/2`, () =>
        HttpResponse.json({
          status: 1,
          error: "",
          Offers: [
            {
              Id: 2,
              OfferId: 101,
              TokenId: 9,
              SellerAddr: "0xbbb",
              BuyerAddr: "0x0000000000000000000000000000000000000000",
              Active: true,
              Price: 2.5,
              TimeStamp: 2,
              DateTime: "2026-01-01T00:00:02Z",
              OfferType: 1
            },
            {
              Id: 1,
              OfferId: 100,
              TokenId: 7,
              SellerAddr: "0xaaa",
              BuyerAddr: "0x0000000000000000000000000000000000000000",
              Active: true,
              Price: 1.25,
              TimeStamp: 1,
              DateTime: "2026-01-01T00:00:01Z",
              OfferType: 1
            }
          ]
        })
      )
    );

    const offers = await getOffers("sell");

    expect(offers).toHaveLength(2);
    expect(offers[0]).toMatchObject({
      offerId: 100,
      tokenId: 7,
      kind: "sell",
      price: 1.25
    });
    expect(offers[1]?.price).toBe(2.5);
  });
});
