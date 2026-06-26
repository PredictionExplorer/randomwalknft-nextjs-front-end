import fc from "fast-check";
import { describe, expect, it } from "vitest";

import {
  FEATURED_TOKEN_FALLBACK_ID,
  sampleFeaturedTokenIds,
  selectFeaturedTokens
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

  it("returns only unique token IDs from the source pool", () => {
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
