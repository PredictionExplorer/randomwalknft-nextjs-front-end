import { describe, expect, it } from "vitest";

import { generateWalk } from "@/lib/walk/walk-engine";
import { sampleChannel, stepBits, WalkPainter } from "@/lib/walk/walk-painter";

const SEED = "0xa8dfd4a1e51e1d29fbbadd2c6e61d2b0c9c6d38ba26f291f04340722d5c2792d";

/** Minimal canvas stand-in: an ImageData-like buffer and a recording 2D context. */
function fakeCanvas() {
  const calls: string[] = [];
  let frame: { data: Uint8ClampedArray; width: number; height: number } | null = null;
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => ({
      createImageData: (width: number, height: number) => {
        frame = { data: new Uint8ClampedArray(width * height * 4), width, height };
        return frame;
      },
      putImageData: () => calls.push("put"),
      fillRect: () => calls.push("head"),
      set fillStyle(_value: string) {
        /* recorded through fillRect */
      }
    })
  } as unknown as HTMLCanvasElement;
  return { canvas, calls, frame: () => frame! };
}

function countPainted(data: Uint8ClampedArray, backgroundByte: number) {
  let painted = 0;
  for (let index = 0; index < data.length; index += 4) {
    if (data[index] !== backgroundByte || data[index + 1] !== backgroundByte || data[index + 2] !== backgroundByte) {
      painted += 1;
    }
  }
  return painted;
}

describe("WalkPainter", () => {
  const walk = generateWalk(SEED, { vert: 60 });

  it("sizes the canvas to the walk and starts empty", () => {
    const { canvas, frame } = fakeCanvas();
    new WalkPainter(canvas, walk, "black");

    expect(canvas.width).toBe(walk.width);
    expect(canvas.height).toBe(walk.height);
    expect(countPainted(frame().data, 0)).toBe(0);
  });

  it("paints monotonically as the draw fraction grows and adds colour on top", () => {
    const { canvas, frame } = fakeCanvas();
    const painter = new WalkPainter(canvas, walk, "black");

    painter.paintTo(0.3, 0);
    const monoPainted = countPainted(frame().data, 0);
    expect(monoPainted).toBeGreaterThan(0);

    painter.paintTo(0.6, 0);
    expect(countPainted(frame().data, 0)).toBeGreaterThanOrEqual(monoPainted);

    // Colouring the first half turns grey pixels into their true colours without un-painting anything.
    painter.paintTo(0.6, 0.5);
    const data = frame().data;
    let coloured = 0;
    for (let index = 0; index < data.length; index += 4) {
      const [r, g, b] = [data[index]!, data[index + 1]!, data[index + 2]!];
      if (!(r === g && g === b)) coloured += 1;
    }
    expect(coloured).toBeGreaterThan(0);
  });

  it("rebuilds cleanly when the visitor scrolls backwards", () => {
    const { canvas, frame } = fakeCanvas();
    const painter = new WalkPainter(canvas, walk, "white");

    painter.paintTo(1, 1);
    const full = countPainted(frame().data, 255);
    painter.paintTo(0.2, 0.2);
    expect(countPainted(frame().data, 255)).toBeLessThan(full);
    painter.paintTo(0, 0);
    expect(countPainted(frame().data, 255)).toBe(0);
  });

  it("marks the walker's head only while the walk is unfinished", () => {
    const { canvas, calls } = fakeCanvas();
    const painter = new WalkPainter(canvas, walk, "black");

    painter.paintTo(0.5, 0.5, { head: true });
    expect(calls).toContain("head");
    calls.length = 0;
    painter.paintTo(1, 1, { head: true });
    expect(calls).not.toContain("head");
    expect(painter.headPosition()).toEqual({ x: walk.xs[walk.pointCount - 1], y: walk.ys[walk.pointCount - 1] });
  });

  it("clamps nonsense fractions", () => {
    const { canvas, frame } = fakeCanvas();
    const painter = new WalkPainter(canvas, walk, "black");
    painter.paintTo(Number.NaN, 7);
    expect(countPainted(frame().data, 0)).toBe(0);
    painter.paintTo(5, -1);
    expect(countPainted(frame().data, 0)).toBeGreaterThan(0);
  });
});

describe("stepBits", () => {
  const walk = generateWalk(SEED, { vert: 40 });

  it("recovers the two bits the generator consumed for each step", () => {
    for (let index = 1; index < 50; index += 1) {
      const step = stepBits(walk, index);
      expect(step).not.toBeNull();
      expect(["00→", "01←", "10↓", "11↑"]).toContain(`${step!.bits}${step!.arrow}`);
    }
  });

  it("returns null outside the walk", () => {
    expect(stepBits(walk, 0)).toBeNull();
    expect(stepBits(walk, -4)).toBeNull();
    expect(stepBits(walk, walk.pointCount)).toBeNull();
  });
});

describe("sampleChannel", () => {
  it("downsamples a colour channel into the unit range", () => {
    const walk = generateWalk(SEED, { vert: 40 });
    const series = sampleChannel(walk, 1, 50);
    expect(series).toHaveLength(50);
    expect(Math.min(...series)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...series)).toBeLessThanOrEqual(1);
    expect(series[0]).toBe((walk.colors[1] ?? 0) / 255);
  });
});
