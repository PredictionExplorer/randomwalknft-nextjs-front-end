import { sha3_256 } from "@noble/hashes/sha3.js";

/**
 * TypeScript port of the published Python generator (`randomWalkGen.py`, see
 * /code): a SHA3-256 bit stream drives a four-direction lattice walk while three
 * color channels drift in parallel. The only deliberate difference is a
 * configurable target size (`vert`) so browsers can draw a faithful miniature
 * instead of the full 1500px render, which takes millions of steps.
 */

/** Yields the SHA3-256 bit stream: digest bytes, LSB-first within each byte. */
class SeedBitStream {
  private readonly input: Uint8Array;
  private digest: Uint8Array;
  private byteIndex = 0;
  private bitIndex = 0;

  constructor(seedBytes: Uint8Array) {
    // Mirrors Python: each round hashes init_seed || previous_seed.
    this.input = new Uint8Array(seedBytes.length * 2);
    this.input.set(seedBytes, 0);
    this.input.set(seedBytes, seedBytes.length);
    this.digest = sha3_256(this.input);
  }

  nextBit(): number {
    if (this.byteIndex >= this.digest.length) {
      this.input.set(this.digest, this.input.length - this.digest.length);
      this.digest = sha3_256(this.input);
      this.byteIndex = 0;
      this.bitIndex = 0;
    }

    const bit = (this.digest[this.byteIndex]! >> this.bitIndex) & 1;
    this.bitIndex += 1;
    if (this.bitIndex === 8) {
      this.bitIndex = 0;
      this.byteIndex += 1;
    }
    return bit;
  }
}

export function hexToBytes(hex: string): Uint8Array {
  const normalized = hex.startsWith("0x") ? hex.slice(2) : hex;
  const even = normalized.length % 2 === 0 ? normalized : `0${normalized}`;
  const bytes = new Uint8Array(even.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(even.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

/** 32 random bytes as 0x-hex — stand-in seed for demo walks. */
export function randomSeedHex(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return `0x${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

export type GeneratedWalk = {
  /** Canvas width in walk pixels (target width + 2 x border). */
  width: number;
  /** Canvas height in walk pixels (target height + 2 x border). */
  height: number;
  /** Number of drawable path points (steps + origin). */
  pointCount: number;
  /** Canvas-space x per point. */
  xs: Int32Array;
  /** Canvas-space y per point. */
  ys: Int32Array;
  /** RGB bytes per point (3 * pointCount). */
  colors: Uint8Array;
};

const ASPECT = 1.6;
const BORDER_PERCENT = 0.03;

export function generateWalk(seedHex: string, options: { vert?: number } = {}): GeneratedWalk {
  const vert = options.vert ?? 300;
  const targetWidth = Math.trunc(vert * ASPECT);
  const targetHeight = vert;
  // Range grows ~sqrt(steps); 80x the area is far past any realistic walk length.
  const maxSteps = Math.max(200_000, 80 * targetWidth * targetHeight);

  const gen = new SeedBitStream(hexToBytes(seedHex));

  let capacity = 1 << 16;
  let horizontal = new Int8Array(capacity);
  let vertical = new Int8Array(capacity);
  let stepCount = 0;

  let x = 0;
  let y = 0;
  let minX = 0;
  let maxX = 0;
  let minY = 0;
  let maxY = 0;

  while (stepCount < maxSteps) {
    if (stepCount === capacity) {
      capacity *= 2;
      const nextHorizontal = new Int8Array(capacity);
      nextHorizontal.set(horizontal);
      horizontal = nextHorizontal;
      const nextVertical = new Int8Array(capacity);
      nextVertical.set(vertical);
      vertical = nextVertical;
    }

    const a = gen.nextBit();
    const b = gen.nextBit();
    if (a === 0 && b === 0) {
      x += 1;
      horizontal[stepCount] = 1;
      vertical[stepCount] = 0;
    } else if (a === 0 && b === 1) {
      x -= 1;
      horizontal[stepCount] = -1;
      vertical[stepCount] = 0;
    } else if (a === 1 && b === 0) {
      y += 1;
      horizontal[stepCount] = 0;
      vertical[stepCount] = 1;
    } else {
      y -= 1;
      horizontal[stepCount] = 0;
      vertical[stepCount] = -1;
    }
    stepCount += 1;

    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;

    const xRange = maxX - minX;
    const yRange = maxY - minY;
    const longerRange = Math.max(xRange, yRange);
    const shorterRange = Math.min(xRange, yRange);
    if (longerRange >= targetWidth || shorterRange >= targetHeight) {
      break;
    }
  }

  // Landscape orientation: make the wider axis horizontal, exactly as the generator does.
  if (maxX - minX < maxY - minY) {
    [horizontal, vertical] = [vertical, horizontal];
    [minX, maxX, minY, maxY] = [minY, maxY, minX, maxX];
  }

  const pointCount = stepCount + 1;

  // Colors: three channels of +/-1 drift over pointCount values, each normalized by its own extremes.
  const channels: Float32Array[] = [];
  for (let channel = 0; channel < 3; channel += 1) {
    const series = new Float32Array(pointCount);
    let current = 0;
    let lowest = Infinity;
    let highest = -Infinity;
    for (let index = 0; index < pointCount; index += 1) {
      current += gen.nextBit() === 1 ? 1 : -1;
      series[index] = current;
      if (current < lowest) lowest = current;
      if (current > highest) highest = current;
    }
    const span = highest - lowest || 1;
    for (let index = 0; index < pointCount; index += 1) {
      series[index] = (series[index]! - lowest) / span;
    }
    channels.push(series);
  }

  const border = Math.trunc(targetHeight * BORDER_PERCENT);
  const width = targetWidth + 2 * border;
  const height = targetHeight + 2 * border;
  const xCenter = (minX + maxX) / 2;
  const yCenter = (minY + maxY) / 2;

  const xs = new Int32Array(pointCount);
  const ys = new Int32Array(pointCount);
  const colors = new Uint8Array(pointCount * 3);

  let walkX = 0;
  let walkY = 0;
  for (let index = 0; index < pointCount; index += 1) {
    if (index > 0) {
      walkX += horizontal[index - 1]!;
      walkY += vertical[index - 1]!;
    }
    xs[index] = Math.trunc(walkX - xCenter + targetWidth / 2) + border;
    ys[index] = Math.trunc(walkY - yCenter + targetHeight / 2) + border;
    colors[index * 3] = Math.trunc(channels[0]![index]! * 255);
    colors[index * 3 + 1] = Math.trunc(channels[1]![index]! * 255);
    colors[index * 3 + 2] = Math.trunc(channels[2]![index]! * 255);
  }

  return { width, height, pointCount, xs, ys, colors };
}
