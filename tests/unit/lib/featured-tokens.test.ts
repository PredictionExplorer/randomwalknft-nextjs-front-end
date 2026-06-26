import fc from "fast-check";
import { describe, expect, it } from "vitest";

import {
  dailyFeaturedTokenIds,
  DAILY_FEATURED_TOKEN_COUNT,
  FEATURED_TOKEN_FALLBACK_ID,
  getUtcDayKey,
  sampleFeaturedTokenIds,
  selectFeaturedTokens,
  selectFeaturedTokensForDisplay
} from "@/lib/featured-tokens";

function randomSequence(values: number[]) {
  let index = 0;
  return () => values[index++] ?? 0;
}

describe("featured token selection", () => {
  it("falls back to token 1 when the featured pool is empty", () => {
    expect(selectFeaturedTokens([])).toEqual({
      featuredId: FEATURED_TOKEN_FALLBACK_ID,
      featuredCards: []
    });
  });

  it("samples featured cards from a shuffled copy of the token pool", () => {
    const ids = [10, 11, 12, 13];

    const result = selectFeaturedTokens(ids, randomSequence([0.75, 0, 0.5]));

    expect(result).toEqual({
      featuredId: 13,
      featuredCards: [13, 11, 10]
    });
    expect(ids).toEqual([10, 11, 12, 13]);
  });

  it("deduplicates random source pools before selecting cards", () => {
    const selected = sampleFeaturedTokenIds([4, 4, 5, 5, 6], 3, randomSequence([0, 0, 0]));

    expect(selected).toEqual([4, 5, 6]);
  });

  it("uses the first daily pool entries for homepage display", () => {
    expect(selectFeaturedTokensForDisplay([90, 10, 29, 93])).toEqual({
      featuredId: 90,
      featuredCards: [90, 10, 29]
    });
  });

  it("returns only unique token IDs from the random source pool", () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.integer({ min: 0, max: 10_000 }), { maxLength: 50 }),
        fc.integer({ min: -5, max: 20 }),
        (ids, count) => {
          const before = [...ids];
          const selected = sampleFeaturedTokenIds(ids, count, () => 0.42);
          const expectedLength = Math.min(Math.max(count, 0), ids.length);

          expect(ids).toEqual(before);
          expect(selected).toHaveLength(expectedLength);
          expect(new Set(selected).size).toBe(selected.length);
          for (const id of selected) {
            expect(ids).toContain(id);
          }
        }
      )
    );
  });
});

describe("daily featured token selection", () => {
  it("formats day keys using UTC boundaries", () => {
    expect(getUtcDayKey(new Date("2026-06-25T23:59:59.999Z"))).toBe("2026-06-25");
    expect(getUtcDayKey(new Date("2026-06-26T00:00:00.000Z"))).toBe("2026-06-26");
  });

  it("returns the same featured pool throughout a UTC day", () => {
    const morningKey = getUtcDayKey(new Date("2026-06-25T05:00:00.000Z"));
    const eveningKey = getUtcDayKey(new Date("2026-06-25T23:59:59.999Z"));

    expect(dailyFeaturedTokenIds(20, { dayKey: morningKey })).toEqual(
      dailyFeaturedTokenIds(20, { dayKey: eveningKey })
    );
  });

  it("locks daily selections to stable SHA-256 golden vectors", () => {
    expect(dailyFeaturedTokenIds(20, { dayKey: "2026-06-25" })).toEqual([
      10, 15, 11, 8, 4, 14, 6, 17, 3, 13, 9, 12, 5, 16, 18
    ]);
    expect(dailyFeaturedTokenIds(20, { dayKey: "2026-06-26" })).toEqual([
      7, 11, 3, 6, 19, 18, 8, 10, 1, 2, 13, 15, 17, 5, 0
    ]);
  });

  it("samples 15 works from larger supplies without allocating the full collection", () => {
    expect(dailyFeaturedTokenIds(100, { dayKey: "2026-06-25" })).toEqual([
      90, 10, 29, 93, 4, 19, 86, 7, 16, 75, 63, 39, 62, 61, 46
    ]);
  });

  it("clamps daily selections for empty and small supplies", () => {
    expect(dailyFeaturedTokenIds(0, { dayKey: "2026-06-25" })).toEqual([]);
    expect(dailyFeaturedTokenIds(2, { dayKey: "2026-06-25" })).toHaveLength(2);
  });

  it("keeps daily selections unique and inside the minted range", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 5_000 }),
        fc.integer({ min: -5, max: 30 }),
        (totalSupply, count) => {
          const selected = dailyFeaturedTokenIds(totalSupply, { dayKey: "2026-06-25", count });
          const expectedLength = Math.min(Math.max(count, 0), totalSupply);

          expect(selected).toHaveLength(expectedLength);
          expect(new Set(selected).size).toBe(selected.length);
          for (const id of selected) {
            expect(id).toBeGreaterThanOrEqual(0);
            expect(id).toBeLessThan(totalSupply);
          }
        }
      )
    );
  });

  it("defaults to the daily featured pool size", () => {
    expect(dailyFeaturedTokenIds(100, { dayKey: "2026-06-25" })).toHaveLength(
      DAILY_FEATURED_TOKEN_COUNT
    );
  });
});
