import type { GeneratedWalk } from "@/lib/walk/walk-engine";

export type WalkBackground = "black" | "white";

/**
 * Incremental pixel painter for a generated walk. Keeps an ImageData buffer and
 * only touches the pixels whose state changed since the last call, so driving it
 * from scroll position at 60Hz costs O(delta) per frame. Points can be painted in
 * two stages — first as a monochrome trail, then in their true colours — which is
 * how the homepage story reveals "shape" before "colour".
 */
export class WalkPainter {
  private readonly context: CanvasRenderingContext2D;
  private readonly frame: ImageData;
  private readonly pixels: Uint8ClampedArray;
  private readonly monoByte: number;
  private readonly backgroundByte: number;
  private drawnCount = 0;
  private coloredCount = 0;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly walk: GeneratedWalk,
    background: WalkBackground
  ) {
    canvas.width = walk.width;
    canvas.height = walk.height;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas 2D context unavailable");
    }
    this.context = context;
    this.backgroundByte = background === "black" ? 0 : 255;
    // The monochrome trail sits between background and ink so colour still reads as a reveal.
    this.monoByte = background === "black" ? 150 : 110;
    this.frame = context.createImageData(walk.width, walk.height);
    this.pixels = this.frame.data;
    this.clear();
  }

  get pointCount(): number {
    return this.walk.pointCount;
  }

  /** Canvas-space position of the most recently painted point (the walker's head). */
  headPosition(): { x: number; y: number } {
    const index = Math.max(0, this.drawnCount - 1);
    return { x: this.walk.xs[index] ?? 0, y: this.walk.ys[index] ?? 0 };
  }

  private clear() {
    const byte = this.backgroundByte;
    for (let index = 0; index < this.pixels.length; index += 4) {
      this.pixels[index] = byte;
      this.pixels[index + 1] = byte;
      this.pixels[index + 2] = byte;
      this.pixels[index + 3] = 255;
    }
    this.drawnCount = 0;
    this.coloredCount = 0;
  }

  private paintPoint(index: number, colored: boolean) {
    const offset = (this.walk.ys[index]! * this.walk.width + this.walk.xs[index]!) * 4;
    if (colored) {
      this.pixels[offset] = this.walk.colors[index * 3]!;
      this.pixels[offset + 1] = this.walk.colors[index * 3 + 1]!;
      this.pixels[offset + 2] = this.walk.colors[index * 3 + 2]!;
    } else {
      this.pixels[offset] = this.monoByte;
      this.pixels[offset + 1] = this.monoByte;
      this.pixels[offset + 2] = this.monoByte;
    }
  }

  /**
   * Paints the walk up to `drawFraction` of its points, with the first `colorFraction`
   * of them in colour. Both fractions are clamped to [0, 1]. Scrolling backwards
   * rebuilds the buffer from scratch, which is still only a few milliseconds.
   */
  paintTo(drawFraction: number, colorFraction: number = drawFraction, options: { head?: boolean } = {}) {
    const total = this.walk.pointCount;
    const targetDrawn = Math.max(0, Math.min(total, Math.round(clamp01(drawFraction) * total)));
    const targetColored = Math.min(targetDrawn, Math.max(0, Math.round(clamp01(colorFraction) * total)));

    if (targetDrawn < this.drawnCount || targetColored < this.coloredCount) {
      this.clear();
    }

    for (let index = this.drawnCount; index < targetDrawn; index += 1) {
      this.paintPoint(index, index < targetColored);
    }
    // Points already drawn in mono that should now be coloured.
    for (let index = this.coloredCount; index < targetColored; index += 1) {
      if (index < this.drawnCount) {
        this.paintPoint(index, true);
      }
    }
    this.drawnCount = targetDrawn;
    this.coloredCount = targetColored;

    this.context.putImageData(this.frame, 0, 0);

    if (options.head && targetDrawn > 0 && targetDrawn < total) {
      const { x, y } = this.headPosition();
      this.context.fillStyle = this.backgroundByte === 0 ? "#ffffff" : "#000000";
      this.context.fillRect(x - 1, y - 1, 3, 3);
    }
  }
}

function clamp01(value: number): number {
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
}

/** Bit pair the generator consumed for the step between two consecutive points. */
export function stepBits(walk: GeneratedWalk, index: number): { bits: string; arrow: string } | null {
  if (index <= 0 || index >= walk.pointCount) {
    return null;
  }
  const dx = walk.xs[index]! - walk.xs[index - 1]!;
  const dy = walk.ys[index]! - walk.ys[index - 1]!;
  if (dx === 1) return { bits: "00", arrow: "→" };
  if (dx === -1) return { bits: "01", arrow: "←" };
  if (dy === 1) return { bits: "10", arrow: "↓" };
  if (dy === -1) return { bits: "11", arrow: "↑" };
  return null;
}

/** Downsampled 0..1 series for one colour channel, for sparkline overlays. */
export function sampleChannel(walk: GeneratedWalk, channel: 0 | 1 | 2, samples = 160): number[] {
  const count = Math.max(1, Math.min(samples, walk.pointCount));
  const result: number[] = [];
  for (let sample = 0; sample < count; sample += 1) {
    const index = Math.min(walk.pointCount - 1, Math.floor((sample / Math.max(1, count - 1)) * (walk.pointCount - 1)));
    result.push((walk.colors[index * 3 + channel] ?? 0) / 255);
  }
  return result;
}
