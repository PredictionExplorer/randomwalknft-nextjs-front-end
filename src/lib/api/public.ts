import "server-only";

import { cache } from "react";
import { z } from "zod";
import { formatEther } from "viem";

import { REVALIDATE_LONG, REVALIDATE_MEDIUM, REVALIDATE_SHORT } from "@/lib/config";
import { getAppConfig } from "@/lib/server/app-config";
import { fetchApi, fetchRwalk, postApi } from "@/lib/api/client";
import {
  actionResponseSchema,
  tokenHistorySchema,
  tokenInfoSchema,
  voteCountSchema
} from "@/lib/api/schemas";
import type { tokenDetailSchema } from "@/lib/api/schemas";

import { nftAbi } from "@/generated/wagmi";
import type { HomepageStats, Nft } from "@/lib/types";
import { dailyFeaturedTokenIds, getUtcDayKey } from "@/lib/featured-tokens";
import { createAssetUrls } from "@/lib/utils";
import { publicClient } from "@/lib/web3/public-client";

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

function normalizeTokenIds(raw: unknown): number[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((id) => {
      if (typeof id === "number") return id;
      if (typeof id === "string" && id.trim() !== "") return Number(id);
      return Number.NaN;
    })
    .filter((n) => Number.isSafeInteger(n) && n >= 0);
}

export const getRandomTokenIds = cache(async (): Promise<number[]> => {
  const raw = await fetchApi<unknown>("api/randomwalk/explore/random?limit=12", {
    revalidate: REVALIDATE_SHORT
  });
  // Go encodes a nil slice as JSON `null`; treat as empty.
  return normalizeTokenIds(raw);
});

/**
 * Same as getRandomTokenIds but bypasses Next.js Data Cache. Use on /random so each navigation
 * (including client <Link>) refetches the explore pool and re-runs server-side random choice.
 */
export async function getRandomTokenIdsFresh(): Promise<number[]> {
  const raw = await fetchApi<unknown>("api/randomwalk/explore/random?limit=12", {
    cache: "no-store"
  });
  return normalizeTokenIds(raw);
}

let homepageFeaturedCache: { dayKey: string; tokenIds: number[] } | null = null;

function getHomepageFeaturedTokenIds(totalSupply: number, dayKey = getUtcDayKey()): number[] {
  if (homepageFeaturedCache?.dayKey === dayKey) {
    return [...homepageFeaturedCache.tokenIds];
  }

  const tokenIds = dailyFeaturedTokenIds(totalSupply, { dayKey });

  if (totalSupply > 0) {
    homepageFeaturedCache = { dayKey, tokenIds };
  }

  return [...tokenIds];
}

export const getHomepageStats = cache(async (): Promise<HomepageStats> => {
  const { NFT_ADDRESS } = await getAppConfig();

  const [
    supplyResult,
    mintPriceResult
  ] = await Promise.allSettled([
    publicClient.readContract({
      address: NFT_ADDRESS,
      abi: nftAbi,
      functionName: "totalSupply"
    }) as Promise<bigint>,
    publicClient.readContract({
      address: NFT_ADDRESS,
      abi: nftAbi,
      functionName: "getMintPrice"
    }) as Promise<bigint>
  ]);

  const totalSupply = supplyResult.status === "fulfilled" ? supplyResult.value : 0n;
  const mintedCount = Number(totalSupply);
  const featuredTokenIds = getHomepageFeaturedTokenIds(mintedCount);
  const mintPrice =
    mintPriceResult.status === "fulfilled" ? Number(formatEther(mintPriceResult.value)) : undefined;

  return {
    mintedCount,
    mintPrice,
    featuredTokenIds
  };
});

export const getRandomPair = cache(async () => {
  return fetchApi<number[]>("api/randomwalk/random", { revalidate: REVALIDATE_SHORT });
});

const beautyPairIdsSchema = z.object({
  token_ids: z.array(z.number()),
  pair_exhausted: z.boolean()
});

/** Two token ids for /compare; pass wallet address to avoid pairs already voted on-chain. */
export async function fetchBeautyComparePairIds(
  voterAddress: string | undefined,
  options?: { skipPairFilter?: boolean }
) {
  const params = new URLSearchParams();
  if (voterAddress && voterAddress.trim() !== "") {
    params.set("voter", voterAddress.trim());
  }
  if (options?.skipPairFilter) {
    params.set("skip_pair_filter", "1");
  }
  const q = params.toString();
  const suffix = q ? `?${q}` : "";
  return fetchApi(
    `api/randomwalk/ranking/beauty-pair-ids${suffix}`,
    { cache: "no-store" },
    beautyPairIdsSchema
  );
}

/** Cached per-request only; fetch is no-store so /compare refetches show an up-to-date total after each vote. */
export const getVoteCount = cache(async () => {
  const response = await fetchApi("api/randomwalk/vote_count", { cache: "no-store" }, voteCountSchema);
  return response.total_count;
});

export const getRatingOrder = cache(async () => {
  return fetchApi<number[]>("api/randomwalk/rating_order", { revalidate: REVALIDATE_LONG });
});

const rankingSignChallengeSchema = z.object({
  nonce: z.string().min(1)
});

/** One-time nonce for wallet-signed beauty votes (Go GET .../ranking/sign-challenge). */
export async function fetchRankingSignChallenge() {
  return fetchApi(
    "api/randomwalk/ranking/sign-challenge",
    { cache: "no-store" },
    rankingSignChallengeSchema
  );
}

export type BeautyVoteSignedPayload = {
  firstId: number;
  secondId: number;
  winner: number;
  signNonce: string;
  signature: `0x${string}`;
  chainId: number;
};

export async function submitBeautyVote(payload: BeautyVoteSignedPayload) {
  const { firstId, secondId, winner, signNonce, signature, chainId } = payload;
  return postApi(
    "api/randomwalk/add_game",
    JSON.stringify({
      nft1: firstId,
      nft2: secondId,
      nft1_win: winner === firstId ? 1 : 0,
      sign_nonce: signNonce,
      signature,
      chain_id: chainId
    }),
    {},
    actionResponseSchema
  );
}
