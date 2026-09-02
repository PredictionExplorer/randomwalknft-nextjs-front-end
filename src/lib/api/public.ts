import "server-only";

import { cache } from "react";
import { formatEther } from "viem";
import { z } from "zod";

import { fetchApi, fetchRwalk, postApi } from "@/lib/api/client";
import { actionResponseSchema, tokenHistorySchema, tokenInfoSchema, voteCountSchema } from "@/lib/api/schemas";
import { REVALIDATE_LONG, REVALIDATE_MEDIUM, REVALIDATE_SHORT } from "@/lib/config";
import { getAppConfig } from "@/lib/server/app-config";

import { nftAbi } from "@/generated/wagmi";
import { dailyFeaturedTokenIds, getUtcDayKey, sampleDistinctIntegers } from "@/lib/featured-tokens";
import type { HomepageStats, Nft, RecentMint, VaultState } from "@/lib/types";
import { createAssetUrls } from "@/lib/utils";
import { getPublicClient } from "@/lib/web3/public-client";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const tokenIdListSchema = z.array(z.number().int().nonnegative());

async function fetchTokenDetail(
  tokenId: number,
  init: { cache?: RequestCache; revalidate?: number } = { revalidate: REVALIDATE_MEDIUM }
): Promise<Nft> {
  const historyInit = init.cache === "no-store" ? { cache: "no-store" as const } : { revalidate: REVALIDATE_SHORT };

  const [infoResponse, historyResponse] = await Promise.all([
    fetchRwalk(`tokens/info/${tokenId}`, init, tokenInfoSchema),
    fetchRwalk(`tokens/history/${tokenId}/0/1000`, historyInit, tokenHistorySchema)
  ]);

  const info = infoResponse.TokenInfo;
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
    id: info.TokenId,
    name: info.CurName,
    owner: info.CurOwnerAddr,
    seed: info.SeedHex,
    assets: createAssetUrls(info.TokenId),
    tokenHistory,
    mintedAt: tokenHistory[0]?.dateTime,
    isPendingMetadata: false
  };
}

/** Just-minted tokens exist on-chain before the indexer knows them: build a stub from the contract. */
async function getPendingTokenDetail(tokenId: number): Promise<Nft | null> {
  try {
    const { NFT_ADDRESS } = await getAppConfig();
    const client = getPublicClient();
    const contract = { address: NFT_ADDRESS, abi: nftAbi } as const;
    const [owner, seed, name] = await Promise.all([
      client.readContract({ ...contract, functionName: "ownerOf", args: [BigInt(tokenId)] }),
      client.readContract({ ...contract, functionName: "seeds", args: [BigInt(tokenId)] }),
      client.readContract({ ...contract, functionName: "tokenNames", args: [BigInt(tokenId)] })
    ]);

    return {
      id: tokenId,
      name,
      owner,
      seed,
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
      await getPublicClient().readContract({
        address: NFT_ADDRESS,
        abi: nftAbi,
        functionName: "totalSupply"
      })
    );

    return sampleDistinctIntegers(totalSupply, count);
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

type VaultReads = {
  supply: bigint;
  prize: bigint | undefined;
  untilWithdrawal: bigint | undefined;
  lastMinter: `0x${string}` | undefined;
  mintPrice: bigint | undefined;
  numWithdrawals: bigint | undefined;
  lastMintTime: bigint | undefined;
};

/**
 * One Multicall3 round-trip on networks that have it (Arbitrum One/Sepolia), individual
 * reads elsewhere (local Hardhat). Every optional field settles independently so a single
 * failing call degrades gracefully; only a failed supply read aborts.
 */
async function readVaultFromChain(): Promise<VaultReads | null> {
  const { NFT_ADDRESS } = await getAppConfig();
  const client = getPublicClient();
  const contract = { address: NFT_ADDRESS, abi: nftAbi } as const;
  const calls = [
    { ...contract, functionName: "totalSupply" },
    { ...contract, functionName: "withdrawalAmount" },
    { ...contract, functionName: "timeUntilWithdrawal" },
    { ...contract, functionName: "lastMinter" },
    { ...contract, functionName: "getMintPrice" },
    { ...contract, functionName: "numWithdrawals" },
    { ...contract, functionName: "lastMintTime" }
  ] as const;

  const settled: Array<{ status: "success"; result: unknown } | { status: "failure" }> = client.chain?.contracts
    ?.multicall3
    ? (await client.multicall({ contracts: calls, allowFailure: true })).map((entry) =>
        entry.status === "success" ? { status: "success", result: entry.result } : { status: "failure" }
      )
    : (await Promise.allSettled(calls.map((call) => client.readContract(call)))).map((entry) =>
        entry.status === "fulfilled" ? { status: "success", result: entry.value } : { status: "failure" }
      );

  const value = <T>(index: number): T | undefined => {
    const entry = settled[index];
    return entry?.status === "success" ? (entry.result as T) : undefined;
  };

  const supply = value<bigint>(0);
  if (supply === undefined) {
    return null;
  }

  return {
    supply,
    prize: value<bigint>(1),
    untilWithdrawal: value<bigint>(2),
    lastMinter: value<`0x${string}`>(3),
    mintPrice: value<bigint>(4),
    numWithdrawals: value<bigint>(5),
    lastMintTime: value<bigint>(6)
  };
}

/**
 * Live Vault game state from the NFT contract (prize pool, countdown, leader).
 * Returns null only when the core supply read fails (e.g. RPC down).
 */
export const getVaultState = cache(async (): Promise<VaultState | null> => {
  if (vaultStateMemo && vaultStateMemo.expiresAtMs > Date.now()) {
    return vaultStateMemo.state;
  }

  try {
    const reads = await readVaultFromChain();
    if (!reads) {
      return null;
    }

    const leader = reads.lastMinter;
    const state: VaultState = {
      prizeEth: reads.prize !== undefined ? Number(formatEther(reads.prize)) : 0,
      prizeWei: (reads.prize ?? 0n).toString(),
      secondsUntilWithdrawal: reads.untilWithdrawal !== undefined ? Number(reads.untilWithdrawal) : 0,
      lastMinter: leader && leader.toLowerCase() !== ZERO_ADDRESS ? leader : undefined,
      mintPriceEth: reads.mintPrice !== undefined ? Number(formatEther(reads.mintPrice)) : undefined,
      mintPriceWei: reads.mintPrice?.toString(),
      mintedCount: Number(reads.supply),
      numWithdrawals: reads.numWithdrawals !== undefined ? Number(reads.numWithdrawals) : 0,
      lastMintAtMs:
        reads.lastMintTime !== undefined && reads.lastMintTime > 0n ? Number(reads.lastMintTime) * 1000 : undefined,
      readAtMs: Date.now()
    };

    vaultStateMemo = { state, expiresAtMs: state.readAtMs + VAULT_STATE_TTL_MS };
    return state;
  } catch {
    return null;
  }
});

const WALL_ROW_COUNT = 8;

/**
 * The newest works with who minted them and when — the "recent acquisitions" feed.
 * Each token costs two cached upstream reads; the count is kept small on purpose.
 */
export const getRecentMints = cache(async (count: number): Promise<RecentMint[]> => {
  const vault = await getVaultState();
  const supply = vault?.mintedCount ?? 0;
  const ids = Array.from({ length: Math.min(count, supply) }, (_, index) => supply - 1 - index);

  const results = await Promise.allSettled(
    ids.map(async (id): Promise<RecentMint> => {
      const [info, history] = await Promise.all([
        fetchRwalk(`tokens/info/${id}`, { revalidate: REVALIDATE_SHORT }, tokenInfoSchema),
        fetchRwalk(`tokens/history/${id}/0/1`, { revalidate: REVALIDATE_SHORT }, tokenHistorySchema).catch(() => null)
      ]);
      const mintRecord = history?.TokenHistory[0]?.Record;
      return {
        id,
        minter: mintRecord?.OwnerAddr ?? info.TokenInfo.CurOwnerAddr,
        mintedAtMs: mintRecord ? mintRecord.TimeStamp * 1000 : undefined
      };
    })
  );

  return results.flatMap((result) => (result.status === "fulfilled" ? [result.value] : []));
});

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
  return fetchApi("api/randomwalk/random", { revalidate: REVALIDATE_SHORT }, tokenIdListSchema);
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
  return fetchApi("api/randomwalk/rating_order", { revalidate: REVALIDATE_LONG }, tokenIdListSchema);
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

/** POST .../add_game — the single place the vote body shape is known. */
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
