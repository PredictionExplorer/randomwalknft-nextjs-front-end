import "server-only";

import { cache } from "react";
import { z } from "zod";

import {
  getConfig,
  REVALIDATE_LONG,
  REVALIDATE_MEDIUM,
  REVALIDATE_SHORT
} from "@/lib/config";
import { fetchApi, fetchRwalk, postApi } from "@/lib/api/client";

/** Go GET /api/rwalk/current_offers/... returns { Offers, status, error }. */
const rwCurrentOffersResponseSchema = z
  .object({
    Offers: offerSchema.array()
  })
  .passthrough();
import {
  actionResponseSchema,
  offerSchema,
  tokenHistorySchema,
  tokenInfoSchema,
  tradingRecordSchema,
  voteCountSchema
} from "@/lib/api/schemas";
import { nftAbi } from "@/generated/wagmi";
import type { HomepageStats, Nft, Offer, TradingRecord } from "@/lib/types";
import { createAssetUrls } from "@/lib/utils";
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
  const { NFT_ADDRESS } = getConfig();
  const historyInit =
    init.cache === "no-store" ? { cache: "no-store" as const } : { revalidate: REVALIDATE_SHORT };

  const [infoResponse, historyResponse] = await Promise.all([
    fetchRwalk(`tokens/info/${NFT_ADDRESS}/${tokenId}`, init, tokenInfoSchema),
    fetchRwalk(`tokens/history/${tokenId}/${NFT_ADDRESS}/0/1000`, historyInit, tokenHistorySchema)
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
    const { NFT_ADDRESS } = getConfig();
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
  const { NFT_ADDRESS } = getConfig();
  return fetchRwalk(
    `tokens/info/${NFT_ADDRESS}/${tokenId}`,
    { revalidate: REVALIDATE_SHORT },
    tokenInfoSchema
  );
});

export const getRandomTokenIds = cache(async () => {
  return fetchApi<number[]>("api/randomwalk/explore/random?limit=12", {
    revalidate: REVALIDATE_SHORT
  });
});

export const getHomepageStats = cache(async (): Promise<HomepageStats> => {
  const { NFT_ADDRESS } = getConfig();
  const [featuredTokenIds, activeListings, activeBids, recentSales, totalSupply] = await Promise.all([
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

  return {
    mintedCount: Number(totalSupply),
    activeListings: activeListings.length,
    activeBids: activeBids.length,
    recentSales: recentSales.tradingHistory.slice(0, 4),
    latestSalePrice: recentSales.tradingHistory[0]?.price,
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
  const { MARKET_ADDRESS, NFT_ADDRESS } = getConfig();
  const res = await fetchRwalk(
    `current_offers/${NFT_ADDRESS}/${MARKET_ADDRESS}/2`,
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
  const { MARKET_ADDRESS } = getConfig();
  const perPage = 20;
  const all = await fetchRwalk(
    `trading/sales/${MARKET_ADDRESS}/0/1000000`,
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
    `trading/sales/${MARKET_ADDRESS}/${start}/${count}`,
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
