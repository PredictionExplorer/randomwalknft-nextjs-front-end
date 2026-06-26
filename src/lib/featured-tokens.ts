import { createHash } from "node:crypto";

export const FEATURED_TOKEN_FALLBACK_ID = 1;
export const FEATURED_CARD_COUNT = 3;
export const DAILY_FEATURED_TOKEN_COUNT = 15;

const HASH_SPACE_48 = 2 ** 48;

type RandomSource = () => number;

export type FeaturedTokenSelection = {
  featuredId: number;
  featuredCards: number[];
};

function randomIndex(length: number, random: RandomSource): number {
  const value = random();
  const safeValue = Number.isFinite(value) ? value : 0;
  const clamped = Math.min(Math.max(safeValue, 0), 1 - Number.EPSILON);
  return Math.floor(clamped * length);
}

function normalizeCount(count: number): number {
  return Number.isFinite(count) ? Math.max(0, Math.trunc(count)) : 0;
}

export function sampleFeaturedTokenIds(
  ids: readonly number[],
  count = FEATURED_CARD_COUNT,
  random: RandomSource = Math.random
): number[] {
  const pool = Array.from(new Set(ids));
  const limit = Math.min(normalizeCount(count), pool.length);

  if (pool.length === 0 || limit === 0) {
    return [];
  }

  for (let index = 0; index < limit; index += 1) {
    const swapIndex = index + randomIndex(pool.length - index, random);
    [pool[index], pool[swapIndex]] = [pool[swapIndex]!, pool[index]!];
  }

  return pool.slice(0, limit);
}

export function selectFeaturedTokens(
  ids: readonly number[],
  random: RandomSource = Math.random
): FeaturedTokenSelection {
  const featuredCards = sampleFeaturedTokenIds(ids, FEATURED_CARD_COUNT, random);
  return selectFeaturedTokensForDisplay(featuredCards);
}

export function selectFeaturedTokensForDisplay(ids: readonly number[]): FeaturedTokenSelection {
  const featuredCards = ids.slice(0, FEATURED_CARD_COUNT);
  return {
    featuredId: featuredCards[0] ?? FEATURED_TOKEN_FALLBACK_ID,
    featuredCards
  };
}

export function getUtcDayKey(date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function hashToBoundedInt(seed: string, drawIndex: number, upperBound: number): number {
  if (upperBound <= 1) {
    return 0;
  }

  const maxUnbiased = Math.floor(HASH_SPACE_48 / upperBound) * upperBound;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const digest = createHash("sha256")
      .update(`${seed}:${drawIndex}:${attempt}`)
      .digest();
    const value = digest.readUIntBE(0, 6);

    if (value < maxUnbiased) {
      return value % upperBound;
    }
  }

  // The rejection path is vanishingly unlikely for NFT-sized ranges; this keeps the function total.
  const digest = createHash("sha256")
    .update(`${seed}:${drawIndex}:fallback`)
    .digest();
  return digest.readUIntBE(0, 6) % upperBound;
}

export function dailyFeaturedTokenIds(
  totalSupply: number,
  options: { dayKey?: string; count?: number } = {}
): number[] {
  const supply = Number.isSafeInteger(totalSupply) ? Math.max(0, totalSupply) : 0;
  const limit = Math.min(normalizeCount(options.count ?? DAILY_FEATURED_TOKEN_COUNT), supply);

  if (supply === 0 || limit === 0) {
    return [];
  }

  const seed = `randomwalk-featured:${options.dayKey ?? getUtcDayKey()}`;
  const swaps = new Map<number, number>();
  const selected: number[] = [];

  const valueAt = (index: number) => swaps.get(index) ?? index;

  for (let index = 0; index < limit; index += 1) {
    const swapIndex = index + hashToBoundedInt(seed, index, supply - index);
    const selectedValue = valueAt(swapIndex);
    const currentValue = valueAt(index);

    swaps.set(index, selectedValue);
    swaps.set(swapIndex, currentValue);
    selected.push(selectedValue);
  }

  return selected;
}
