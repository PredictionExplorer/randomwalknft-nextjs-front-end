import { sha3_256 } from "@noble/hashes/sha3.js";
import { bytesToHex } from "@noble/hashes/utils.js";

import { generateWalk } from "../../../src/lib/walk/walk-engine.ts";
import { encodePng } from "./png.ts";

/** The wallet the E2E mock wallet connects with; it owns a few works and holds the key. */
export const TEST_ACCOUNT = "0x1234567890abcdef1234567890abcdef12345678";
export const NFT_ADDRESS = "0x895a6F444BE4ba9d124F61DF736605792B35D66b";
export const MARKET_ADDRESS = "0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08";
export const MULTICALL3_ADDRESS = "0xcA11bde05977b3631167028862bE2a173976CA11";
export const CHAIN_ID = 42161;

const DAY = 86_400;
const ETH = 10n ** 18n;

export type WorldState = {
  totalSupply: number;
  /** Wei the keyholder receives when the clock reaches zero. */
  withdrawalAmountWei: bigint;
  mintPriceWei: bigint;
  secondsUntilWithdrawal: number;
  numWithdrawals: number;
  lastMinter: string;
  lastMintTime: number;
  timeUntilSale: number;
  /** Token ids whose files are "still rendering" upstream (404 on assets). */
  pendingTokens: number[];
  walletTokens: Record<string, number[]>;
  names: Record<number, string>;
  voteCount: number;
  /** Hashes returned by the wallet for which a receipt should confirm a mint. */
  pendingMintHashes: string[];
};

export function defaultState(): WorldState {
  return {
    totalSupply: 4097,
    withdrawalAmountWei: 40_680_000_000_000_000_000n,
    mintPriceWei: 90_500_000_000_000_000n,
    secondsUntilWithdrawal: 27 * DAY + 12 * 3600 + 34 * 60 + 5,
    numWithdrawals: 0,
    lastMinter: TEST_ACCOUNT,
    lastMintTime: Math.floor(Date.now() / 1000) - 2 * DAY,
    timeUntilSale: 0,
    pendingTokens: [],
    walletTokens: { [TEST_ACCOUNT.toLowerCase()]: [12, 40, 4096] },
    names: { 12: "Drift" },
    voteCount: 12_345,
    pendingMintHashes: []
  };
}

export let state: WorldState = defaultState();

export function resetState() {
  state = defaultState();
}

export function patchState(patch: Partial<WorldState> & { withdrawalAmountEth?: number; mintPriceEth?: number }) {
  const { withdrawalAmountEth, mintPriceEth, ...rest } = patch;
  Object.assign(state, rest);
  if (withdrawalAmountEth !== undefined)
    state.withdrawalAmountWei = BigInt(Math.round(withdrawalAmountEth * 1e6)) * (ETH / 1_000_000n);
  if (mintPriceEth !== undefined) state.mintPriceWei = BigInt(Math.round(mintPriceEth * 1e6)) * (ETH / 1_000_000n);
}

/** Deterministic 32-byte seed per token, as the contract would store it (0x-hex). */
export function seedFor(tokenId: number): `0x${string}` {
  return `0x${bytesToHex(sha3_256(new TextEncoder().encode(`rw-e2e-seed-${tokenId}`)))}`;
}

/** Deterministic owner address per token; the test account owns its listed works. */
export function ownerOf(tokenId: number): string {
  for (const [wallet, ids] of Object.entries(state.walletTokens)) {
    if (ids.includes(tokenId)) return wallet;
  }
  const digest = bytesToHex(sha3_256(new TextEncoder().encode(`rw-e2e-owner-${tokenId}`))).slice(0, 40);
  return `0x${digest}`;
}

export function mintTimestamp(tokenId: number): number {
  // Spread mints across 2021..now, roughly one every ~10 hours, newest most recent.
  const base = Date.UTC(2021, 9, 1) / 1000;
  return Math.min(base + tokenId * 36_000, state.lastMintTime);
}

/** Worst-first beauty order: a fixed permutation so ranks are stable across runs. */
export function ratingOrder(): number[] {
  const ids = Array.from({ length: state.totalSupply }, (_, id) => id);
  // Deterministic shuffle (LCG) so the same ids always rank the same.
  let x = 12345;
  for (let i = ids.length - 1; i > 0; i -= 1) {
    x = (x * 1103515245 + 12345) & 0x7fffffff;
    const j = x % (i + 1);
    [ids[i], ids[j]] = [ids[j]!, ids[i]!];
  }
  return ids;
}

export function randomTokenIds(count: number, salt: number): number[] {
  const out: number[] = [];
  let x = 987654321 + salt;
  while (out.length < count && out.length < state.totalSupply) {
    x = (x * 1103515245 + 12345) & 0x7fffffff;
    const id = x % state.totalSupply;
    if (!out.includes(id)) out.push(id);
  }
  return out;
}

const imageCache = new Map<string, Uint8Array>();

/** Renders the token's real walk (miniature) as a PNG so screenshots show art, not placeholders. */
export function artworkPng(tokenId: number, edition: "black" | "white", thumb: boolean): Uint8Array {
  const key = `${tokenId}:${edition}:${thumb}`;
  const cached = imageCache.get(key);
  if (cached) return cached;

  const walk = generateWalk(seedFor(tokenId), { vert: thumb ? 60 : 150 });
  const background = edition === "black" ? 0 : 255;
  const rgb = new Uint8Array(walk.width * walk.height * 3).fill(background);
  for (let index = 0; index < walk.pointCount; index += 1) {
    const offset = (walk.ys[index]! * walk.width + walk.xs[index]!) * 3;
    rgb[offset] = walk.colors[index * 3]!;
    rgb[offset + 1] = walk.colors[index * 3 + 1]!;
    rgb[offset + 2] = walk.colors[index * 3 + 2]!;
  }
  const png = encodePng(walk.width, walk.height, rgb);
  imageCache.set(key, png);
  return png;
}
