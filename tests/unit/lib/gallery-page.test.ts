import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { PAGE_SIZE } from "@/lib/config";
import { resolveGalleryPage } from "@/lib/gallery-page";
import type { CollectionQueryState } from "@/lib/types";

const WALLET = "0x1234567890abcdef1234567890abcdef12345678";

function state(overrides: Partial<CollectionQueryState> = {}): CollectionQueryState {
  return { sortBy: "tokenId", page: 1, view: "gallery", ...overrides };
}

describe("resolveGalleryPage", () => {
  it("hangs the newest works first without materialising the whole collection", () => {
    const page = resolveGalleryPage({ state: state(), totalSupply: 100 });
    expect(page.items[0]).toBe(99);
    expect(page.items).toHaveLength(PAGE_SIZE);
    expect(page.totalItems).toBe(100);
    expect(page.totalPages).toBe(Math.ceil(100 / PAGE_SIZE));
  });

  it("clamps out-of-range pages instead of returning an empty wall", () => {
    const page = resolveGalleryPage({ state: state({ page: 999 }), totalSupply: 50 });
    expect(page.page).toBe(page.totalPages);
    expect(page.items.length).toBeGreaterThan(0);
    expect(page.items.at(-1)).toBe(0);
  });

  it("jump-to-token shows exactly that work, or nothing when it does not exist yet", () => {
    expect(resolveGalleryPage({ state: state({ query: 7 }), totalSupply: 10 })).toEqual({
      items: [7],
      totalItems: 1,
      totalPages: 1,
      page: 1
    });
    expect(resolveGalleryPage({ state: state({ query: 10 }), totalSupply: 10 }).items).toEqual([]);
  });

  it("ranks the beauty room best-first from the worst-first API order", () => {
    const ratingOrder = [4, 1, 9, 2];
    const page = resolveGalleryPage({ state: state({ sortBy: "beauty" }), totalSupply: 10, ratingOrder });
    expect(page.items).toEqual([2, 9, 1, 4]);
    expect(page.totalItems).toBe(4);
  });

  it("shows a wallet's works newest first, and only its works in beauty order", () => {
    const walletTokenIds = [3, 40, 12];
    const newest = resolveGalleryPage({ state: state({ address: WALLET }), totalSupply: 0, walletTokenIds });
    expect(newest.items).toEqual([40, 12, 3]);

    const beauty = resolveGalleryPage({
      state: state({ address: WALLET, sortBy: "beauty" }),
      totalSupply: 0,
      walletTokenIds,
      ratingOrder: [12, 5, 40, 3, 99]
    });
    expect(beauty.items).toEqual([3, 40, 12]);
  });

  it("filters a wallet wall down to one token when a query is present", () => {
    const page = resolveGalleryPage({
      state: state({ address: WALLET, query: 12 }),
      totalSupply: 0,
      walletTokenIds: [3, 40, 12]
    });
    expect(page.items).toEqual([12]);
    expect(
      resolveGalleryPage({ state: state({ address: WALLET, query: 8 }), totalSupply: 0, walletTokenIds: [3] }).items
    ).toEqual([]);
  });

  it("never returns more than a page and always reports a valid page number", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 5000 }),
        fc.integer({ min: -3, max: 400 }),
        fc.constantFrom<"tokenId" | "beauty">("tokenId", "beauty"),
        (totalSupply, requestedPage, sortBy) => {
          const ratingOrder = Array.from({ length: totalSupply }, (_, id) => id);
          const page = resolveGalleryPage({ state: state({ page: requestedPage, sortBy }), totalSupply, ratingOrder });
          expect(page.items.length).toBeLessThanOrEqual(PAGE_SIZE);
          expect(page.page).toBeGreaterThanOrEqual(1);
          expect(page.page).toBeLessThanOrEqual(page.totalPages);
          expect(page.totalItems).toBe(totalSupply);
          for (const id of page.items) {
            expect(id).toBeGreaterThanOrEqual(0);
            expect(id).toBeLessThan(totalSupply);
          }
        }
      )
    );
  });
});
