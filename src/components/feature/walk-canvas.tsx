"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { generateWalk, randomSeedHex, type GeneratedWalk } from "@/lib/walk/walk-engine";

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Draws a random walk live on a canvas using the real generation algorithm.
 * With no `seed`, a random one is drawn — pass a new `drawKey` to redraw.
 */
export function WalkCanvas({
  seed,
  drawKey = 0,
  vert = 300,
  background = "black",
  durationMs = 16_000,
  onComplete,
  className,
  label = "Random walk artwork drawing itself point by point"
}: {
  /** 0x-hex seed. Omit for a random walk per draw. */
  seed?: string | undefined;
  /** Bump to redraw (used with random seeds). */
  drawKey?: number;
  /** Walk resolution: target height in walk pixels. */
  vert?: number;
  background?: "black" | "white";
  durationMs?: number;
  onComplete?: (() => void) | undefined;
  className?: string;
  label?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onCompleteRef = useRef(onComplete);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    let cancelled = false;
    let frameId = 0;

    // Defer generation one tick so the canvas paints its background first.
    const startId = window.setTimeout(() => {
      if (cancelled) {
        return;
      }

      const walk: GeneratedWalk = generateWalk(seed ?? randomSeedHex(), { vert });
      canvas.width = walk.width;
      canvas.height = walk.height;
      setDimensions({ width: walk.width, height: walk.height });

      const context = canvas.getContext("2d");
      if (!context) {
        return;
      }

      const backgroundByte = background === "black" ? 0 : 255;
      const frame = context.createImageData(walk.width, walk.height);
      const pixels = frame.data;
      for (let index = 0; index < pixels.length; index += 4) {
        pixels[index] = backgroundByte;
        pixels[index + 1] = backgroundByte;
        pixels[index + 2] = backgroundByte;
        pixels[index + 3] = 255;
      }

      let drawnCount = 0;
      const paintRange = (until: number) => {
        for (let index = drawnCount; index < until; index += 1) {
          const offset = (walk.ys[index]! * walk.width + walk.xs[index]!) * 4;
          pixels[offset] = walk.colors[index * 3]!;
          pixels[offset + 1] = walk.colors[index * 3 + 1]!;
          pixels[offset + 2] = walk.colors[index * 3 + 2]!;
        }
        drawnCount = until;
        context.putImageData(frame, 0, 0);
      };

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reducedMotion || durationMs <= 0) {
        paintRange(walk.pointCount);
        onCompleteRef.current?.();
        return;
      }

      const startedAt = performance.now();
      const tick = (now: number) => {
        if (cancelled) {
          return;
        }
        const progress = Math.min(1, (now - startedAt) / durationMs);
        paintRange(Math.max(1, Math.floor(easeInOutCubic(progress) * walk.pointCount)));

        if (progress < 1) {
          // Walker head: a bright dot marking the newest point.
          const headIndex = Math.max(0, drawnCount - 1);
          context.fillStyle = background === "black" ? "#ffffff" : "#000000";
          context.fillRect(walk.xs[headIndex]! - 1, walk.ys[headIndex]! - 1, 3, 3);
          frameId = window.requestAnimationFrame(tick);
        } else {
          onCompleteRef.current?.();
        }
      };
      frameId = window.requestAnimationFrame(tick);
    }, 30);

    return () => {
      cancelled = true;
      window.clearTimeout(startId);
      window.cancelAnimationFrame(frameId);
    };
  }, [seed, drawKey, vert, background, durationMs]);

  return (
    <div
      role="img"
      aria-label={label}
      className={cn("w-full", className)}
      style={{
        backgroundColor: background,
        aspectRatio: dimensions ? `${dimensions.width} / ${dimensions.height}` : "1.66 / 1"
      }}
    >
      <canvas ref={canvasRef} aria-hidden className="block h-full w-full" style={{ imageRendering: "pixelated" }} />
    </div>
  );
}
