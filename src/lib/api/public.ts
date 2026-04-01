import "server-only";

import { cache } from "react";
import { z } from "zod";

import { REVALIDATE_LONG, REVALIDATE_MEDIUM, REVALIDATE_SHORT } from "@/lib/config";
import { getAppConfig } from "@/lib/server/app-config";
import { fetchApi, fetchRwalk, postApi } from "@/lib/api/client";
import {
  actionResponseSchema,
  offerSchema,
  tokenDetailSchema,
  tokenHistorySchema,
  tokenInfoSchema,
  tradingRecordSchema,
  voteCountSchema
} from "@/lib/api/schemas";

/** Go GET /api/randomwalk/current_offers/:order_by returns { Offers, status, error }. */
const rwCurrentOffersResponseSchema = z
  .object({
    Offers: offerSchema.array()
  })
  .passthrough();
import { nftAbi } from "@/generated/wagmi";
import type { HomepageStats, Nft, Offer, TradingRecord } from "@/lib/types";
import { createAssetUrls } from "@/lib/utils";
import { getCurrentNetworkName } from "@/lib/web3/evm-chain";
import { publicClient } from "@/lib/web3/public-client";

function normalizeOffer(
  input: z.infer<typeof offerSchema>,
  kind: "buy" | "sell"
): Offer {
  return {
    id: input.Id,
    offerId: input.OfferId,
    tokenId: input.TokenId,
    seller: input.SellerAddr,
    buyer: input.BuyerAddr,
    price: input.Price,
    active: input.Active,
    createdAt: input.DateTime,
    createdAtTimestamp: input.TimeStamp,
    kind
  };
}

function normalizeTokenDetail(
  token: z.infer<typeof tokenDetailSchema>,
  historyResponse: z.infer<typeof tokenHistorySchema>
): Nft {
  const tokenHistory = historyResponse.TokenHistory.map((entry) => ({
    recordType: entry.RecordType,
    blockNumber: entry.Record.BlockNum,
    timestamp: entry.Record.TimeStamp,
    dateTime: entry.Record.DateTime,
    owner: entry.Record.OwnerAddr,
    seller: entry.Record.SellerAddr,
    buyer: entry.Record.BuyerAddr,
    price: entry.Record.Price,
    offerId: entry.Record.OfferId
  }));

  return {
    id: token.id,
    name: token.name,
    owner: token.owner,
    seed: token.seed,
    rating: token.rating,
    assets: createAssetUrls(token.id),
    tokenHistory,
    mintedAt: tokenHistory[0]?.dateTime,
    isPendingMetadata: false
  };
}

async function fetchTokenDetail(
  tokenId: number,
  init: { cache?: RequestCache; revalidate?: number } = { revalidate: REVALIDATE_MEDIUM }
): Promise<Nft> {
  const { NFT_ADDRESS } = await getAppConfig();
  const historyInit =
    init.cache === "no-store" ? { cache: "no-store" as const } : { revalidate: REVALIDATE_SHORT };

  const [infoResponse, historyResponse] = await Promise.all([
    fetchRwalk(`tokens/info/${tokenId}`, init, tokenInfoSchema),
    fetchRwalk(`tokens/history/${tokenId}/0/1000`, historyInit, tokenHistorySchema)
  ]);

  const t = infoResponse.TokenInfo;
  const token = {
    id: t.TokenId,
    name: t.CurName,
    owner: t.CurOwnerAddr,
    seed: t.SeedHex,
    rating: 0,
    status: 1
  };

  return normalizeTokenDetail(token, historyResponse);
}

async function getPendingTokenDetail(tokenId: number): Promise<Nft | null> {
  try {
    const { NFT_ADDRESS } = await getAppConfig();
    const [owner, seed, name] = await Promise.all([
      publicClient.readContract({
        address: NFT_ADDRESS,
        abi: nftAbi,
        functionName: "ownerOf",
        args: [BigInt(tokenId)]
      }) as Promise<`0x${string}`>,
      publicClient.readContract({
        address: NFT_ADDRESS,
        abi: nftAbi,
        functionName: "seeds",
        args: [BigInt(tokenId)]
      }) as Promise<`0x${string}`>,
      publicClient.readContract({
        address: NFT_ADDRESS,
        abi: nftAbi,
        functionName: "tokenNames",
        args: [BigInt(tokenId)]
      }) as Promise<string>
    ]);

    return {
      id: tokenId,
      name,
      owner,
      seed,
      rating: 0,
      assets: createAssetUrls(tokenId),
      tokenHistory: [],
      isPendingMetadata: true
    };
  } catch {
    return null;
  }
}

export const getTokenDetail = cache(async (tokenId: number): Promise<Nft> => {
  return fetchTokenDetail(tokenId);
});

export async function getTokenDetailFresh(tokenId: number): Promise<Nft> {
  return fetchTokenDetail(tokenId, { cache: "no-store" });
}

export async function getTokenDetailOrFallback(
  tokenId: number,
  options: { fresh?: boolean } = {}
): Promise<Nft | null> {
  try {
    return options.fresh ? await getTokenDetailFresh(tokenId) : await getTokenDetail(tokenId);
  } catch {
    return getPendingTokenDetail(tokenId);
  }
}

export const getTokenInfo = cache(async (tokenId: number) => {
  return fetchRwalk(`tokens/info/${tokenId}`, { revalidate: REVALIDATE_SHORT }, tokenInfoSchema);
});

export const getRandomTokenIds = cache(async (): Promise<number[]> => {
  const raw = await fetchApi<number[] | null>("api/randomwalk/explore/random?limit=12", {
    revalidate: REVALIDATE_SHORT
  });
  // Go encodes a nil slice as JSON `null`; treat as empty.
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.map((id) => Number(id)).filter((n) => Number.isFinite(n) && n >= 0);
});

export const getHomepageStats = cache(async (): Promise<HomepageStats> => {
  const { NFT_ADDRESS } = await getAppConfig();

  if (getCurrentNetworkName() === "local") {
    const supplyResult = await Promise.allSettled([
      publicClient.readContract({
        address: NFT_ADDRESS,
        abi: nftAbi,
        functionName: "totalSupply"
      }) as Promise<bigint>
    ]);
    const totalSupply = supplyResult[0].status === "fulfilled" ? supplyResult[0].value : 0n;
    return {
      mintedCount: Number(totalSupply),
      activeListings: 0,
      activeBids: 0,
      recentSales: [],
      latestSalePrice: undefined,
      featuredTokenIds: []
    };
  }

  const [featuredResult, sellResult, buyResult, historyResult, supplyResult] = await Promise.allSettled([
    getRandomTokenIds(),
    getOffers("sell"),
    getOffers("buy"),
    getTradingHistory(1),
    publicClient.readContract({
      address: NFT_ADDRESS,
      abi: nftAbi,
      functionName: "totalSupply"
    }) as Promise<bigint>
  ]);

  const featuredTokenIds = featuredResult.status === "fulfilled" ? featuredResult.value : [];
  const activeListings =
    sellResult.status === "fulfilled" ? sellResult.value.length : 0;
  const activeBids = buyResult.status === "fulfilled" ? buyResult.value.length : 0;
  const recentSalesPage =
    historyResult.status === "fulfilled"
      ? historyResult.value
      : { tradingHistory: [] as TradingRecord[], totalCount: 0 };
  const totalSupply = supplyResult.status === "fulfilled" ? supplyResult.value : 0n;

  return {
    mintedCount: Number(totalSupply),
    activeListings,
    activeBids,
    recentSales: recentSalesPage.tradingHistory.slice(0, 4),
    latestSalePrice: recentSalesPage.tradingHistory[0]?.price,
    featuredTokenIds
  };
});

export const getRandomPair = cache(async () => {
  return fetchApi<number[]>("random", { revalidate: REVALIDATE_SHORT });
});

export const getVoteCount = cache(async () => {
  const response = await fetchApi("vote_count", { revalidate: REVALIDATE_SHORT }, voteCountSchema);
  return response.total_count;
});

export const getRatingOrder = cache(async () => {
  return fetchApi<number[]>("rating_order", { revalidate: REVALIDATE_LONG });
});

const getAllActiveOffersRaw = cache(async () => {
  const res = await fetchRwalk(
    `current_offers/2`,
    { revalidate: REVALIDATE_SHORT },
    rwCurrentOffersResponseSchema
  );
  return res.Offers;
});

/** otype 0 = buy, 1 = sell (matches rwcg notibot / DB conventions). */
export const getOffers = cache(async (kind: "buy" | "sell") => {
  const wantType = kind === "buy" ? 0 : 1;
  const response = (await getAllActiveOffersRaw()).filter((item) => item.OfferType === wantType);

  return response
    .map((item) => normalizeOffer(item, kind))
    .sort((left, right) => left.price - right.price);
});

export const getOffersForToken = cache(async (tokenId: number) => {
  const [buyOffers, sellOffers] = await Promise.all([getOffers("buy"), getOffers("sell")]);

  return {
    buyOffers: buyOffers.filter((offer) => offer.tokenId === tokenId),
    sellOffers: sellOffers.filter((offer) => offer.tokenId === tokenId)
  };
});

export const getTradingHistory = cache(async (page: number) => {
  const perPage = 20;
  const all = await fetchRwalk(
    `trading/sales/0/1000000`,
    { revalidate: REVALIDATE_SHORT },
    z.object({ Trading: tradingRecordSchema.array() })
  );
  const totalCount = all.Trading.length;
  let start = totalCount - perPage * page;
  let count = perPage;

  if (start < 0) {
    count += start;
    start = 0;
  }

  const response = await fetchRwalk(
    `trading/sales/${start}/${count}`,
    { revalidate: REVALIDATE_SHORT },
    z.object({ Trading: tradingRecordSchema.array() })
  );

  const tradingHistory: TradingRecord[] = response.Trading.sort(
    (left, right) => right.TimeStamp - left.TimeStamp
  ).map((item) => ({
    id: item.Id,
    offerId: item.OfferId,
    tokenId: item.TokenId,
    seller: item.SellerAddr,
    buyer: item.BuyerAddr,
    price: item.Price,
    timestamp: item.TimeStamp,
    createdAt: item.DateTime,
    txHash: item.TxHash
  }));

  return {
    tradingHistory,
    totalCount
  };
});

export async function submitBeautyVote(firstId: number, secondId: number, winner: number) {
  return postApi(
    "add_game",
    JSON.stringify({
      nft1: firstId,
      nft2: secondId,
      nft1_win: winner === firstId ? 1 : 0
    }),
    {},
    actionResponseSchema
  );
}
