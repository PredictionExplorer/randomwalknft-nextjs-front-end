export const FEATURED_TOKEN_FALLBACK_ID = 1;
export const FEATURED_CARD_COUNT = 3;

type RandomSource = () => number;

function randomIndex(length: number, random: RandomSource): number {
  const value = random();
  const safeValue = Number.isFinite(value) ? value : 0;
  const clamped = Math.min(Math.max(safeValue, 0), 1 - Number.EPSILON);
  return Math.floor(clamped * length);
}

export function sampleFeaturedTokenIds(
  ids: readonly number[],
  count = FEATURED_CARD_COUNT,
  random: RandomSource = Math.random
): number[] {
  if (ids.length === 0 || count <= 0) {
    return [];
  }

  const pool = [...ids];
  const limit = Math.min(Math.trunc(count), pool.length);

  for (let index = 0; index < limit; index += 1) {
    const swapIndex = index + randomIndex(pool.length - index, random);
    [pool[index], pool[swapIndex]] = [pool[swapIndex]!, pool[index]!];
  }

  return pool.slice(0, limit);
}

export function selectFeaturedTokens(
  ids: readonly number[],
  random: RandomSource = Math.random
) {
  const featuredCards = sampleFeaturedTokenIds(ids, FEATURED_CARD_COUNT, random);
  return {
    featuredId: featuredCards[0] ?? FEATURED_TOKEN_FALLBACK_ID,
    featuredCards
  };
}
