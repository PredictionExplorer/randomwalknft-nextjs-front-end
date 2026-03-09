// @vitest-environment node

import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import {
  getOffersForToken,
  getRandomPair,
  getRatingOrder,
  getTokenDetail,
  getTradingHistory,
  getVoteCount,
  submitBeautyVote
} from "@/lib/api/public";
import { API_BASE_URL, NFT_ADDRESS, RWALK_BASE_URL, MARKET_ADDRESS } from "@/lib/config";
import { server } from "../../setup/msw/server";

const offerPayload = (
  id: number,
  offerId: number,
  tokenId: number,
  price: number,
  dateTime: string,
  timeStamp: number
) => ({
  Id: id,
  OfferId: offerId,
  TokenId: tokenId,
  SellerAddr: "0xaaa",
  BuyerAddr: "0x0000000000000000000000000000000000000000",
  Active: true,
  Price: price,
  TimeStamp: timeStamp,
  DateTime: dateTime,
  OfferType: 1
});

describe("getVoteCount", () => {
  it("returns total_count from vote_count endpoint", async () => {
    server.use(
      http.get(`${API_BASE_URL}/vote_count`, () =>
        HttpResponse.json({ total_count: 42 })
      )
    );

    const count = await getVoteCount();

    expect(count).toBe(42);
  });
});

describe("getRandomPair", () => {
  it("returns number array from random endpoint", async () => {
    server.use(
      http.get(`${API_BASE_URL}/random`, () =>
        HttpResponse.json([101, 202])
      )
    );

    const pair = await getRandomPair();

    expect(pair).toEqual([101, 202]);
  });
});

describe("getRatingOrder", () => {
  it("returns number array from rating_order endpoint", async () => {
    server.use(
      http.get(`${API_BASE_URL}/rating_order`, () =>
        HttpResponse.json([3, 1, 4, 2, 5])
      )
    );

    const order = await getRatingOrder();

    expect(order).toEqual([3, 1, 4, 2, 5]);
  });
});

describe("getOffersForToken", () => {
  it("filters buy and sell offers by tokenId", async () => {
    const targetTokenId = 42;
    server.use(
      http.get(`${API_BASE_URL}/buy_offer`, () =>
        HttpResponse.json([
          offerPayload(1, 100, targetTokenId, 1.5, "2026-01-01T00:00:01Z", 1),
          offerPayload(2, 101, 99, 2.0, "2026-01-01T00:00:02Z", 2)
        ])
      ),
      http.get(`${API_BASE_URL}/sell_offer`, () =>
        HttpResponse.json([
          offerPayload(3, 102, targetTokenId, 3.0, "2026-01-01T00:00:03Z", 3),
          offerPayload(4, 103, 88, 4.0, "2026-01-01T00:00:04Z", 4)
        ])
      )
    );

    const result = await getOffersForToken(targetTokenId);

    expect(result.buyOffers).toHaveLength(1);
    expect(result.buyOffers[0]).toMatchObject({
      tokenId: targetTokenId,
      offerId: 100,
      kind: "buy",
      price: 1.5
    });
    expect(result.sellOffers).toHaveLength(1);
    expect(result.sellOffers[0]).toMatchObject({
      tokenId: targetTokenId,
      offerId: 102,
      kind: "sell",
      price: 3.0
    });
  });

  it("returns empty arrays when no offers match tokenId", async () => {
    server.use(
      http.get(`${API_BASE_URL}/buy_offer`, () =>
        HttpResponse.json([
          offerPayload(1, 100, 1, 1.5, "2026-01-01T00:00:01Z", 1)
        ])
      ),
      http.get(`${API_BASE_URL}/sell_offer`, () =>
        HttpResponse.json([
          offerPayload(2, 101, 2, 2.0, "2026-01-01T00:00:02Z", 2)
        ])
      )
    );

    const result = await getOffersForToken(999);

    expect(result.buyOffers).toHaveLength(0);
    expect(result.sellOffers).toHaveLength(0);
  });
});

describe("getTokenDetail", () => {
  it("fetches and transforms token data with history", async () => {
    server.use(
      http.get(`${API_BASE_URL}/tokens/5`, () =>
        HttpResponse.json({
          id: 5,
          name: "Token Five",
          owner: "0xowner",
          seed: "0xseed",
          rating: 4.5,
          status: 1
        })
      ),
      http.get(`${RWALK_BASE_URL}/tokens/history/5/${NFT_ADDRESS}/0/1000`, () =>
        HttpResponse.json({
          TokenHistory: [
            {
              RecordType: 1,
              Record: {
                BlockNum: 100,
                TimeStamp: 1700000000,
                DateTime: "2023-11-14T00:00:00Z",
                OwnerAddr: "0xowner"
              }
            }
          ]
        })
      )
    );

    const nft = await getTokenDetail(5);

    expect(nft.id).toBe(5);
    expect(nft.name).toBe("Token Five");
    expect(nft.owner).toBe("0xowner");
    expect(nft.seed).toBe("0xseed");
    expect(nft.rating).toBe(4.5);
    expect(nft.tokenHistory).toHaveLength(1);
    expect(nft.tokenHistory[0]?.recordType).toBe(1);
    expect(nft.mintedAt).toBe("2023-11-14T00:00:00Z");
    expect(nft.assets.blackThumb).toContain("000005");
  });
});

describe("getTradingHistory", () => {
  const makeTradingRecords = (count: number) =>
    Array.from({ length: count }, (_, i) => ({
      Id: i + 1,
      OfferId: 100 + i,
      TokenId: i,
      SellerAddr: "0xseller",
      BuyerAddr: "0xbuyer",
      Price: 1.0 + i * 0.1,
      TimeStamp: 1700000000 + i * 100,
      DateTime: `2023-11-14T00:${String(i).padStart(2, "0")}:00Z`,
      TxHash: `0xtx${i}`
    }));

  it("paginates and transforms trading records for page 1", async () => {
    const tradingRecords = makeTradingRecords(25);
    server.use(
      http.get(new RegExp(`${RWALK_BASE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/trading/sales/${MARKET_ADDRESS}`), () =>
        HttpResponse.json({ Trading: tradingRecords })
      )
    );

    const result = await getTradingHistory(1);

    expect(result.totalCount).toBe(25);
    expect(result.tradingHistory.length).toBeGreaterThan(0);
    expect(result.tradingHistory[0]?.seller).toBe("0xseller");
    expect(result.tradingHistory[0]?.buyer).toBe("0xbuyer");
    expect(result.tradingHistory[0]?.txHash).toContain("0xtx");
  });

  it("handles page beyond available data (start < 0 branch)", async () => {
    const tradingRecords = makeTradingRecords(10);
    server.use(
      http.get(new RegExp(`${RWALK_BASE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/trading/sales/${MARKET_ADDRESS}`), () =>
        HttpResponse.json({ Trading: tradingRecords })
      )
    );

    const result = await getTradingHistory(5);

    expect(result.totalCount).toBe(10);
  });
});

describe("submitBeautyVote", () => {
  it("POSTs to add_game with nft1_win 1 when firstId wins", async () => {
    let capturedBody: unknown = null;
    server.use(
      http.post(`${API_BASE_URL}/add_game`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({ result: "ok" });
      })
    );

    const response = await submitBeautyVote(10, 20, 10);

    expect(response).toEqual({ result: "ok" });
    expect(capturedBody).toEqual({
      nft1: 10,
      nft2: 20,
      nft1_win: 1
    });
  });

  it("POSTs to add_game with nft1_win 0 when secondId wins", async () => {
    let capturedBody: unknown = null;
    server.use(
      http.post(`${API_BASE_URL}/add_game`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({ result: "success" });
      })
    );

    const response = await submitBeautyVote(10, 20, 20);

    expect(response).toEqual({ result: "success" });
    expect(capturedBody).toEqual({
      nft1: 10,
      nft2: 20,
      nft1_win: 0
    });
  });
});
