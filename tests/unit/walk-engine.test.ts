import { describe, expect, it } from "vitest";

import { generateWalk, hexToBytes, isSeedHex, randomSeedHex, seedFromInput } from "@/lib/walk/walk-engine";

/** Seed of token #0 (public on-chain data), used as a stable fixture. */
const FIXTURE_SEED = "0xa8dfd4a1e51e1d29fbbadd2c6e61d2b0c9c6d38ba26f291f04340722d5c2792d";

describe("walk-engine", () => {
  it("parses hex with and without 0x prefix", () => {
    expect(hexToBytes("0x00ff")).toEqual(new Uint8Array([0, 255]));
    expect(hexToBytes("00ff")).toEqual(new Uint8Array([0, 255]));
  });

  it("generates a deterministic walk for a fixed seed", () => {
    const first = generateWalk(FIXTURE_SEED, { vert: 120 });
    const second = generateWalk(FIXTURE_SEED, { vert: 120 });

    expect(first.pointCount).toBe(second.pointCount);
    expect(Array.from(first.xs.slice(0, 32))).toEqual(Array.from(second.xs.slice(0, 32)));
    expect(Array.from(first.colors.slice(0, 32))).toEqual(Array.from(second.colors.slice(0, 32)));
  });

  it("respects the generator geometry (aspect, border, landscape orientation)", () => {
    const walk = generateWalk(FIXTURE_SEED, { vert: 120 });
    const border = Math.trunc(120 * 0.03);

    expect(walk.width).toBe(Math.trunc(120 * 1.6) + 2 * border);
    expect(walk.height).toBe(120 + 2 * border);
    expect(walk.pointCount).toBeGreaterThan(1000);
    expect(walk.xs.length).toBe(walk.pointCount);
    expect(walk.colors.length).toBe(walk.pointCount * 3);

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (let index = 0; index < walk.pointCount; index += 1) {
      minX = Math.min(minX, walk.xs[index]!);
      maxX = Math.max(maxX, walk.xs[index]!);
      minY = Math.min(minY, walk.ys[index]!);
      maxY = Math.max(maxY, walk.ys[index]!);
    }

    // Landscape after the orientation swap, and every point inside the canvas.
    expect(maxX - minX).toBeGreaterThanOrEqual(maxY - minY);
    expect(minX).toBeGreaterThanOrEqual(0);
    expect(minY).toBeGreaterThanOrEqual(0);
    expect(maxX).toBeLessThan(walk.width);
    expect(maxY).toBeLessThan(walk.height);
  });

  it("produces different walks for different seeds", () => {
    const a = generateWalk(randomSeedHex(), { vert: 80 });
    const b = generateWalk(randomSeedHex(), { vert: 80 });
    expect(a.pointCount === b.pointCount && a.xs[100] === b.xs[100] && a.xs[500] === b.xs[500]).toBe(false);
  });

  it("normalizes every color channel to the full byte range", () => {
    const walk = generateWalk(FIXTURE_SEED, { vert: 80 });
    for (let channel = 0; channel < 3; channel += 1) {
      let low = 255;
      let high = 0;
      for (let index = 0; index < walk.pointCount; index += 1) {
        const value = walk.colors[index * 3 + channel]!;
        low = Math.min(low, value);
        high = Math.max(high, value);
      }
      expect(low).toBe(0);
      expect(high).toBe(255);
    }
  });
});

describe("seed helpers", () => {
  it("accepts exactly 32-byte hex seeds, with or without the 0x prefix", () => {
    expect(isSeedHex("0x" + "ab".repeat(32))).toBe(true);
    expect(isSeedHex("AB".repeat(32))).toBe(true);
    expect(isSeedHex("0x" + "ab".repeat(31))).toBe(false);
    expect(isSeedHex("hello")).toBe(false);
  });

  it("normalises real seeds and hashes anything else into one", () => {
    expect(seedFromInput(" " + "AB".repeat(32) + " ")).toBe("0x" + "ab".repeat(32));
    const hashed = seedFromInput("a name, a date, a sentence");
    expect(isSeedHex(hashed)).toBe(true);
    expect(seedFromInput("a name, a date, a sentence")).toBe(hashed);
    expect(seedFromInput("another")).not.toBe(hashed);
  });
});
