import "server-only";

import { cache } from "react";
import { z } from "zod";
import { formatEther } from "viem";

import { REVALIDATE_LONG, REVALIDATE_MEDIUM, REVALIDATE_SHORT } from "@/lib/config";
import { getAppConfig } from "@/lib/server/app-config";
import { fetchApi, fetchRwalk, postApi } from "@/lib/api/client";
import { actionResponseSchema, tokenHistorySchema, tokenInfoSchema, voteCountSchema } from "@/lib/api/schemas";
import type { tokenDetailSchema } from "@/lib/api/schemas";

import { nftAbi } from "@/generated/wagmi";
import type { HomepageStats, Nft, VaultState } from "@/lib/types";
import { dailyFeaturedTokenIds, getUtcDayKey, sampleFeaturedTokenIds } from "@/lib/featured-tokens";
import { createAssetUrls } from "@/lib/utils";
import { publicClient } from "@/lib/web3/public-client";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

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
  const historyInit = init.cache === "no-store" ? { cache: "no-store" as const } : { revalidate: REVALIDATE_SHORT };

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
      }),
      publicClient.readContract({
        address: NFT_ADDRESS,
        abi: nftAbi,
        functionName: "seeds",
        args: [BigInt(tokenId)]
      }),
      publicClient.readContract({
        address: NFT_ADDRESS,
        abi: nftAbi,
        functionName: "tokenNames",
        args: [BigInt(tokenId)]
      })
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

export async function getTokenDetailOrFallback(
  tokenId: number,
  options: { fresh?: boolean } = {}
): Promise<Nft | null> {
  try {
    return options.fresh ? await fetchTokenDetail(tokenId, { cache: "no-store" }) : await getTokenDetail(tokenId);
  } catch {
    return getPendingTokenDetail(tokenId);
  }
}

export const getTokenInfo = cache(async (tokenId: number) => {
  return fetchRwalk(`tokens/info/${tokenId}`, { revalidate: REVALIDATE_SHORT }, tokenInfoSchema);
});

/**
 * Unique random token ids sampled from the minted supply, fresh on every call. Reads totalSupply
 * from the chain (like /api/random-token) because the backend explore/random endpoint returns a
 * constant list. Returns an empty array when the supply read fails so callers degrade gracefully.
 */
export async function getRandomMintedTokenIds(count: number): Promise<number[]> {
  try {
    const { NFT_ADDRESS } = await getAppConfig();
    const totalSupply = Number(
      await publicClient.readContract({
        address: NFT_ADDRESS,
        abi: nftAbi,
        functionName: "totalSupply"
      })
    );

    const pool = Array.from({ length: Math.max(0, totalSupply) }, (_, tokenId) => tokenId);
    return sampleFeaturedTokenIds(pool, count);
  } catch {
    return [];
  }
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

/**
 * Every page view reads vault state (header ticker seed, homepage, vault page,
 * llms.txt, OG image). A short process-level memo keeps traffic bursts from
 * hammering the RPC while staying fresh enough for a 30-day game clock; the
 * client re-derives the ticking countdown from `readAtMs`, so a memoized
 * snapshot stays accurate.
 */
const VAULT_STATE_TTL_MS = 15_000;
let vaultStateMemo: { state: VaultState; expiresAtMs: number } | null = null;

/**
 * Live Vault game state from the NFT contract (prize pool, countdown, leader).
 * Reads settle independently so a single failing call degrades gracefully;
 * returns null only when the core supply read fails (e.g. RPC down).
 */
export const getVaultState = cache(async (): Promise<VaultState | null> => {
  if (vaultStateMemo && vaultStateMemo.expiresAtMs > Date.now()) {
    return vaultStateMemo.state;
  }

  try {
    const { NFT_ADDRESS } = await getAppConfig();
    const read = <T>(functionName: string) =>
      publicClient.readContract({
        address: NFT_ADDRESS,
        abi: nftAbi,
        functionName: functionName as never
      }) as Promise<T>;

    const [supply, prize, untilWithdrawal, lastMinter, mintPrice, numWithdrawals] = await Promise.allSettled([
      read<bigint>("totalSupply"),
      read<bigint>("withdrawalAmount"),
      read<bigint>("timeUntilWithdrawal"),
      read<`0x${string}`>("lastMinter"),
      read<bigint>("getMintPrice"),
      read<bigint>("numWithdrawals")
    ]);

    if (supply.status !== "fulfilled") {
      return null;
    }

    const leader = lastMinter.status === "fulfilled" ? lastMinter.value : undefined;

    const state: VaultState = {
      prizeEth: prize.status === "fulfilled" ? Number(formatEther(prize.value)) : 0,
      secondsUntilWithdrawal: untilWithdrawal.status === "fulfilled" ? Number(untilWithdrawal.value) : 0,
      lastMinter: leader && leader.toLowerCase() !== ZERO_ADDRESS ? leader : undefined,
      mintPriceEth: mintPrice.status === "fulfilled" ? Number(formatEther(mintPrice.value)) : undefined,
      mintedCount: Number(supply.value),
      numWithdrawals: numWithdrawals.status === "fulfilled" ? Number(numWithdrawals.value) : 0,
      readAtMs: Date.now()
    };

    vaultStateMemo = { state, expiresAtMs: state.readAtMs + VAULT_STATE_TTL_MS };
    return state;
  } catch {
    return null;
  }
});

const WALL_ROW_COUNT = 8;

export const getHomepageStats = cache(async (): Promise<HomepageStats> => {
  const [vault, ratingOrderResult] = await Promise.all([getVaultState(), getRatingOrder().catch(() => [] as number[])]);

  const mintedCount = vault?.mintedCount ?? 0;
  const featuredTokenIds = getHomepageFeaturedTokenIds(mintedCount);

  // rating_order returns worst-first (gallery reverses it for display), so the best sit at the end.
  const beautyTopIds = ratingOrderResult.slice(-WALL_ROW_COUNT).reverse();
  const newestIds = Array.from(
    { length: Math.min(WALL_ROW_COUNT, mintedCount) },
    (_, index) => mintedCount - 1 - index
  );

  return {
    mintedCount,
    mintPrice: vault?.mintPriceEth,
    featuredTokenIds,
    beautyTopIds,
    newestIds,
    vault
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
  return fetchApi(`api/randomwalk/ranking/beauty-pair-ids${suffix}`, { cache: "no-store" }, beautyPairIdsSchema);
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
  return fetchApi("api/randomwalk/ranking/sign-challenge", { cache: "no-store" }, rankingSignChallengeSchema);
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
