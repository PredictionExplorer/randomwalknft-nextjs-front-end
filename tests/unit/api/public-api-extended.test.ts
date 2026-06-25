// @vitest-environment node

import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import {
  getRandomPair,
  getRatingOrder,
  getTokenDetail,
  getTokenDetailOrFallback,
  getVoteCount,
  submitBeautyVote
} from "@/lib/api/public";
import { getBaseConfig } from "@/lib/config";
import { publicClient } from "@/lib/web3/public-client";
import { server } from "../../setup/msw/server";

const { API_BASE_URL, RWALK_BASE_URL } = getBaseConfig();

describe("getVoteCount", () => {
  it("returns total_count from vote_count endpoint", async () => {
    server.use(
      http.get(`${API_BASE_URL}/api/randomwalk/vote_count`, () =>
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
      http.get(`${API_BASE_URL}/api/randomwalk/random`, () =>
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
      http.get(`${API_BASE_URL}/api/randomwalk/rating_order`, () =>
        HttpResponse.json([3, 1, 4, 2, 5])
      )
    );

    const order = await getRatingOrder();

    expect(order).toEqual([3, 1, 4, 2, 5]);
  });
});

describe("getTokenDetail", () => {
  it("fetches and transforms token data with history", async () => {
    server.use(
      http.get(`${RWALK_BASE_URL}/tokens/info/5`, () =>
        HttpResponse.json({
          status: 1,
          error: "",
          TokenInfo: {
            TokenId: 5,
            CurOwnerAddr: "0xowner",
            SeedHex: "0xseed",
            CurName: "Token Five",
            LastPrice: 0,
            TotalVolume: 0,
            NumTrades: 0
          }
        })
      ),
      http.get(`${RWALK_BASE_URL}/tokens/history/5/0/1000`, () =>
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
    expect(nft.rating).toBe(0);
    expect(nft.tokenHistory).toHaveLength(1);
    expect(nft.tokenHistory[0]?.recordType).toBe(1);
    expect(nft.mintedAt).toBe("2023-11-14T00:00:00Z");
    expect(nft.assets.blackThumb).toContain("000005");
  });

  it("falls back to on-chain token data when the token API has not indexed a fresh mint yet", async () => {
    const readContractMock = vi.spyOn(publicClient, "readContract");
    readContractMock
      .mockResolvedValueOnce("0xowner")
      .mockResolvedValueOnce("0xseed")
      .mockResolvedValueOnce("");

    server.use(
      http.get(`${RWALK_BASE_URL}/tokens/info/8`, () =>
        HttpResponse.json({ error: "Not found" }, { status: 404 })
      ),
      http.get(`${RWALK_BASE_URL}/tokens/history/8/0/1000`, () =>
        HttpResponse.json({ error: "Not found" }, { status: 404 })
      )
    );

    const nft = await getTokenDetailOrFallback(8, { fresh: true });

    expect(nft).toMatchObject({
      id: 8,
      owner: "0xowner",
      seed: "0xseed",
      isPendingMetadata: true
    });
    expect(nft?.tokenHistory).toEqual([]);

    readContractMock.mockRestore();
  });
});

describe("submitBeautyVote", () => {
  it("POSTs to add_game with nft1_win 1 when firstId wins", async () => {
    let capturedBody: unknown = null;
    server.use(
      http.post(`${API_BASE_URL}/api/randomwalk/add_game`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({ result: "ok" });
      })
    );

    const response = await submitBeautyVote({
      firstId: 10,
      secondId: 20,
      winner: 10,
      signNonce: "sn",
      signature: ("0x" + "11".repeat(65)) as `0x${string}`,
      chainId: 42161
    });

    expect(response).toEqual({ result: "ok" });
    expect(capturedBody).toEqual({
      nft1: 10,
      nft2: 20,
      nft1_win: 1,
      sign_nonce: "sn",
      signature: "0x" + "11".repeat(65),
      chain_id: 42161
    });
  });

  it("POSTs to add_game with nft1_win 0 when secondId wins", async () => {
    let capturedBody: unknown = null;
    server.use(
      http.post(`${API_BASE_URL}/api/randomwalk/add_game`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({ result: "success" });
      })
    );

    const response = await submitBeautyVote({
      firstId: 10,
      secondId: 20,
      winner: 20,
      signNonce: "sn2",
      signature: ("0x" + "22".repeat(65)) as `0x${string}`,
      chainId: 42161
    });

    expect(response).toEqual({ result: "success" });
    expect(capturedBody).toEqual({
      nft1: 10,
      nft2: 20,
      nft1_win: 0,
      sign_nonce: "sn2",
      signature: "0x" + "22".repeat(65),
      chain_id: 42161
    });
  });
});
