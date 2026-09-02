/**
 * Layout math for the constellation map: every token in the collection as a point
 * on a Vogel (sunflower) spiral, which packs N points evenly into a disc. Pure and
 * unit-tested; the canvas component only draws what this computes.
 */

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

export type ConstellationLayout = "mint" | "beauty";

export type ConstellationPoint = {
  id: number;
  /** Normalised position in [-1, 1] on both axes (centre 0). */
  x: number;
  y: number;
};

/**
 * Position for the point at spiral index `index` of `count`. Index 0 sits at the
 * centre; later indices spiral outwards to radius 1.
 */
export function spiralPosition(index: number, count: number): { x: number; y: number } {
  if (count <= 1) {
    return { x: 0, y: 0 };
  }
  const radius = Math.sqrt((index + 0.5) / count);
  const angle = index * GOLDEN_ANGLE;
  return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
}

/**
 * Lays out ids 0..count-1. In `mint` order the oldest token is at the centre; in
 * `beauty` order the most beautiful is at the centre and ranks spiral outwards.
 * `beautyOrder` is the API's worst-first list; ids missing from it sit outermost.
 */
export function layoutConstellation(
  count: number,
  layout: ConstellationLayout,
  beautyOrder: readonly number[] = []
): ConstellationPoint[] {
  const total = Math.max(0, Math.floor(count));
  if (total === 0) {
    return [];
  }

  if (layout === "mint") {
    return Array.from({ length: total }, (_, id) => ({ id, ...spiralPosition(id, total) }));
  }

  // Rank 0 = most beautiful. The API lists worst first, so reverse it.
  const rankById = new Map<number, number>();
  for (let index = beautyOrder.length - 1, rank = 0; index >= 0; index -= 1) {
    const id = beautyOrder[index]!;
    if (id >= 0 && id < total && !rankById.has(id)) {
      rankById.set(id, rank);
      rank += 1;
    }
  }
  let nextRank = rankById.size;
  const points: ConstellationPoint[] = [];
  for (let id = 0; id < total; id += 1) {
    let rank = rankById.get(id);
    if (rank === undefined) {
      rank = nextRank;
      nextRank += 1;
    }
    points.push({ id, ...spiralPosition(rank, total) });
  }
  return points;
}

/** Beauty rank (1 = best) for an id, or undefined when unranked. */
export function beautyRankOf(id: number, beautyOrder: readonly number[]): number | undefined {
  const index = beautyOrder.lastIndexOf(id);
  return index === -1 ? undefined : beautyOrder.length - index;
}

/**
 * Nearest point to a normalised cursor position within `radius` (normalised units).
 * Linear scan is fine at collection scale (a few thousand points) and only runs on hover.
 */
export function nearestPoint(
  points: readonly ConstellationPoint[],
  x: number,
  y: number,
  radius: number
): ConstellationPoint | null {
  let best: ConstellationPoint | null = null;
  let bestDistance = radius * radius;
  for (const point of points) {
    const dx = point.x - x;
    const dy = point.y - y;
    const distance = dx * dx + dy * dy;
    if (distance <= bestDistance) {
      bestDistance = distance;
      best = point;
    }
  }
  return best;
}
