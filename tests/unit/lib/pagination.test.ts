import { describe, expect, it } from "vitest";

import {
  clampPage,
  getDescendingTokenPage,
  getPaginationWindow,
  paginateItems
} from "@/lib/pagination";

describe("pagination helpers", () => {
  it("clamps invalid page values", () => {
    expect(clampPage(-5, 10)).toBe(1);
    expect(clampPage(999, 3)).toBe(3);
  });

  it("paginates arrays without mutating the full set", () => {
    const result = paginateItems([1, 2, 3, 4, 5], 2, 2);
    expect(result.items).toEqual([3, 4]);
    expect(result.totalPages).toBe(3);
    expect(result.page).toBe(2);
  });

  it("derives descending token pages without generating the whole gallery page in the UI", () => {
    const result = getDescendingTokenPage(100, 2, 24);
    expect(result.items[0]).toBe(75);
    expect(result.items.at(-1)).toBe(52);
    expect(result.totalPages).toBe(5);
  });

  it("builds a compact pagination window for large result sets", () => {
    expect(getPaginationWindow(1, 10)).toEqual([1, 2, "ellipsis", 10]);
    expect(getPaginationWindow(5, 10)).toEqual([1, "ellipsis", 4, 5, 6, "ellipsis", 10]);
    expect(getPaginationWindow(10, 10)).toEqual([1, "ellipsis", 9, 10]);
  });
});
