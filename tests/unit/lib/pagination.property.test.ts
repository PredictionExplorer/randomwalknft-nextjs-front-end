import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { getDescendingTokenPage, paginateItems } from "@/lib/pagination";

describe("pagination invariants", () => {
  it("never returns more than the requested page size", () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer(), { minLength: 0, maxLength: 200 }),
        fc.integer({ min: 1, max: 20 }),
        fc.integer({ min: 1, max: 50 }),
        (items, page, pageSize) => {
          const result = paginateItems(items, page, pageSize);
          expect(result.items.length).toBeLessThanOrEqual(pageSize);
          expect(result.page).toBeGreaterThanOrEqual(1);
          expect(result.totalPages).toBeGreaterThanOrEqual(1);
        }
      )
    );
  });

  it("returns descending token ids within valid bounds", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 5000 }),
        fc.integer({ min: 1, max: 50 }),
        fc.integer({ min: 1, max: 100 }),
        (totalSupply, page, pageSize) => {
          const result = getDescendingTokenPage(totalSupply, page, pageSize);
          expect(result.items.length).toBeLessThanOrEqual(pageSize);
          for (const id of result.items) {
            expect(id).toBeGreaterThanOrEqual(0);
            expect(id).toBeLessThan(Math.max(totalSupply, 1));
          }
          for (let index = 1; index < result.items.length; index += 1) {
            expect(result.items[index - 1]).toBeGreaterThan(result.items[index]!);
          }
        }
      )
    );
  });
});
