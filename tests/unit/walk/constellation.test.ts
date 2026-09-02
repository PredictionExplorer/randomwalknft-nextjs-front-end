import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { beautyRankOf, layoutConstellation, nearestPoint, spiralPosition } from "@/lib/walk/constellation";

describe("spiralPosition", () => {
  it("places index 0 at the centre and later indices further out, all inside the unit disc", () => {
    fc.assert(
      fc.property(fc.integer({ min: 2, max: 5000 }), (count) => {
        const first = spiralPosition(0, count);
        const last = spiralPosition(count - 1, count);
        expect(Math.hypot(first.x, first.y)).toBeLessThan(Math.hypot(last.x, last.y));
        expect(Math.hypot(last.x, last.y)).toBeLessThanOrEqual(1);
      })
    );
  });

  it("collapses to the origin for a single point", () => {
    expect(spiralPosition(0, 1)).toEqual({ x: 0, y: 0 });
  });
});

describe("layoutConstellation", () => {
  it("lays out every id exactly once in mint order", () => {
    const points = layoutConstellation(12, "mint");
    expect(points.map((point) => point.id)).toEqual(Array.from({ length: 12 }, (_, id) => id));
    expect(Math.hypot(points[0]!.x, points[0]!.y)).toBeLessThan(Math.hypot(points[11]!.x, points[11]!.y));
  });

  it("puts the most beautiful work at the centre in beauty order", () => {
    // API order is worst-first, so id 7 is the most beautiful here.
    const points = layoutConstellation(8, "beauty", [3, 0, 5, 1, 2, 6, 4, 7]);
    const byId = new Map(points.map((point) => [point.id, Math.hypot(point.x, point.y)]));
    expect(byId.get(7)).toBeLessThan(byId.get(3)!);
    expect(byId.get(4)).toBeLessThan(byId.get(0)!);
  });

  it("pushes unranked ids to the outside and tolerates duplicates and out-of-range ids", () => {
    const points = layoutConstellation(4, "beauty", [9, 1, 1, 2]);
    const byId = new Map(points.map((point) => [point.id, Math.hypot(point.x, point.y)]));
    expect(byId.get(2)).toBeLessThan(byId.get(0)!);
    expect(byId.get(2)).toBeLessThan(byId.get(3)!);
    expect(points).toHaveLength(4);
  });

  it("returns nothing for an empty collection", () => {
    expect(layoutConstellation(0, "mint")).toEqual([]);
    expect(layoutConstellation(-5, "beauty")).toEqual([]);
  });
});

describe("beautyRankOf", () => {
  it("counts from the best (last) entry", () => {
    const order = [3, 0, 5];
    expect(beautyRankOf(5, order)).toBe(1);
    expect(beautyRankOf(3, order)).toBe(3);
    expect(beautyRankOf(9, order)).toBeUndefined();
  });
});

describe("nearestPoint", () => {
  const points = layoutConstellation(200, "mint");

  it("finds the point under the cursor and nothing when the cursor is far away", () => {
    const target = points[57]!;
    expect(nearestPoint(points, target.x + 0.001, target.y - 0.001, 0.02)?.id).toBe(57);
    expect(nearestPoint(points, 3, 3, 0.02)).toBeNull();
  });
});
