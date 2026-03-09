import "server-only";

import { cache } from "react";
import { z } from "zod";

import {
  MARKET_ADDRESS,
  NFT_ADDRESS,
  REVALIDATE_LONG,
  REVALIDATE_MEDIUM,
  REVALIDATE_SHORT
} from "@/lib/config";
import { fetchApi, fetchRwalk, postApi } from "@/lib/api/client";
import {
  actionResponseSchema,
  authCheckResponseSchema,
  blogSchema,
  loginResponseSchema,
  offerSchema,
  tokenDetailSchema,
  tokenHistorySchema,
  tokenInfoSchema,
  tradingRecordSchema,
  voteCountSchema
} from "@/lib/api/schemas";
import { nftAbi } from "@/generated/wagmi";
import type { BlogPost, HomepageStats, Nft, Offer, TradingRecord } from "@/lib/types";
import { createAssetUrls, slugify } from "@/lib/utils";
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

function normalizeBlog(input: z.infer<typeof blogSchema>): BlogPost {
  return {
    id: input.id,
    title: input.title,
    epic: input.epic,
    content: input.content,
    bannerImage: input.banner_image,
    thumbImage: input.thumb_image,
    slug: input.slug,
    status: input.status,
    createdAt: input.created_at
  };
}

export const getTokenDetail = cache(async (tokenId: number): Promise<Nft> => {
  const [token, historyResponse] = await Promise.all([
    fetchApi(`tokens/${tokenId}`, { revalidate: REVALIDATE_MEDIUM }, tokenDetailSchema),
    fetchRwalk(
      `tokens/history/${tokenId}/${NFT_ADDRESS}/0/1000`,
      { revalidate: REVALIDATE_SHORT },
      tokenHistorySchema
    )
  ]);

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
    mintedAt: tokenHistory[0]?.dateTime
  };
});

export const getTokenInfo = cache(async (tokenId: number) => {
  return fetchRwalk(
    `tokens/info/${NFT_ADDRESS}/${tokenId}`,
    { revalidate: REVALIDATE_SHORT },
    tokenInfoSchema
  );
});

export const getRandomTokenIds = cache(async () => {
  return fetchApi<number[]>("random_token", { revalidate: REVALIDATE_SHORT });
});

export const getHomepageStats = cache(async (): Promise<HomepageStats> => {
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

export const getOffers = cache(async (kind: "buy" | "sell") => {
  const response = await fetchApi(
    kind === "buy" ? "buy_offer" : "sell_offer",
    { revalidate: REVALIDATE_SHORT },
    offerSchema.array()
  );

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

export const getBlogs = cache(async () => {
  const response = await fetchApi("get_all_blogs", { revalidate: REVALIDATE_MEDIUM }, blogSchema.array());
  return response.map(normalizeBlog).sort((left, right) => right.createdAt - left.createdAt);
});

export const getBlogBySlug = cache(async (slug: string) => {
  const response = await fetchApi(
    `get_blog_by_title/${slug}`,
    { revalidate: REVALIDATE_MEDIUM },
    blogSchema
  );
  return normalizeBlog(response);
});

export const getBlogById = cache(async (blogId: number) => {
  const response = await fetchApi(`get_blog/${blogId}`, { revalidate: REVALIDATE_SHORT }, blogSchema);
  return normalizeBlog(response);
});

export async function loginAdmin(email: string, password: string) {
  return postApi(
    "login",
    JSON.stringify({ email, password }),
    {},
    loginResponseSchema
  );
}

export async function registerAdmin(username: string, email: string, password: string) {
  return postApi(
    "register",
    JSON.stringify({ username, email, password }),
    {},
    actionResponseSchema
  );
}

export async function checkAdminToken(email: string, token: string) {
  return postApi(
    "check_token",
    JSON.stringify({ email, token }),
    {},
    authCheckResponseSchema
  );
}

export async function createBlog(formData: FormData) {
  return postApi("create_blog", formData, {}, actionResponseSchema);
}

export async function updateBlog(formData: FormData) {
  return postApi("edit_blog", formData, {}, actionResponseSchema);
}

export async function deleteBlog(blogId: number) {
  return postApi(
    "delete_blog",
    JSON.stringify({ blog_id: blogId }),
    {},
    actionResponseSchema
  );
}

export async function toggleBlog(blogId: number, status: boolean) {
  return postApi(
    "toggle_blog",
    JSON.stringify({ blog_id: blogId, status }),
    {},
    actionResponseSchema
  );
}

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

export async function ensureUniqueBlogSlug(title: string, currentId?: number) {
  const slug = slugify(title);

  try {
    const existing = await getBlogBySlug(slug);
    return existing.id === currentId;
  } catch {
    return true;
  }
}
