"use client";

import { useEffect, useEffectEvent, useImperativeHandle, useRef, useState, type Ref } from "react";

import { cn } from "@/lib/utils";
import { generateWalk, randomSeedHex, type GeneratedWalk } from "@/lib/walk/walk-engine";
import { WalkPainter, type WalkBackground } from "@/lib/walk/walk-painter";

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Imperative surface for scroll-driven drawing; avoids a React render per frame. */
export type WalkCanvasHandle = {
  /** Paint up to a fraction of the walk, optionally with a smaller coloured fraction. */
  paintTo: (drawFraction: number, colorFraction?: number) => void;
  /** Canvas-space position of the walker's head after the last paint. */
  headPosition: () => { x: number; y: number };
};

type WalkCanvasProps = {
  /** 0x-hex seed. Omit for a random walk per draw. */
  seed?: string | undefined;
  /** Bump to redraw (used with random seeds). */
  drawKey?: number;
  /** Walk resolution: target height in walk pixels. */
  vert?: number;
  background?: WalkBackground;
  /**
   * Autonomous mode: animate the drawing over this many milliseconds. Set to `0`
   * (or pass `handle`) for controlled mode, where the parent drives `paintTo`.
   */
  durationMs?: number;
  /** Controlled mode: receive the imperative painter. */
  handle?: Ref<WalkCanvasHandle | null> | undefined;
  onComplete?: (() => void) | undefined;
  /** Fires once the walk is generated (controlled mode uses it for overlays). */
  onWalk?: ((walk: GeneratedWalk, seed: string) => void) | undefined;
  className?: string;
  label?: string;
};

/**
 * Draws a random walk on a canvas using the real generation algorithm. Runs on
 * its own clock by default; hand it a `handle` to drive the drawing from scroll.
 */
export function WalkCanvas({
  seed,
  drawKey = 0,
  vert = 300,
  background = "black",
  durationMs = 16_000,
  handle,
  onComplete,
  onWalk,
  className,
  label = "Random walk artwork drawing itself point by point"
}: WalkCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const painterRef = useRef<WalkPainter | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const controlled = handle !== undefined || durationMs <= 0;

  const notifyComplete = useEffectEvent(() => onComplete?.());
  const notifyWalk = useEffectEvent((walk: GeneratedWalk, usedSeed: string) => onWalk?.(walk, usedSeed));

  useImperativeHandle(
    handle,
    () => ({
      paintTo: (drawFraction, colorFraction) => {
        painterRef.current?.paintTo(drawFraction, colorFraction ?? drawFraction, { head: drawFraction < 1 });
      },
      headPosition: () => painterRef.current?.headPosition() ?? { x: 0, y: 0 }
    }),
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    let cancelled = false;
    let frameId = 0;
    let idleId = 0;

    const start = () => {
      if (cancelled) {
        return;
      }

      const usedSeed = seed ?? randomSeedHex();
      const walk = generateWalk(usedSeed, { vert });
      let painter: WalkPainter;
      try {
        painter = new WalkPainter(canvas, walk, background);
      } catch {
        return;
      }
      painterRef.current = painter;
      setDimensions({ width: walk.width, height: walk.height });
      notifyWalk(walk, usedSeed);

      if (controlled) {
        // The parent decides how much is visible; start from an empty canvas.
        painter.paintTo(0, 0);
        return;
      }

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reducedMotion) {
        painter.paintTo(1, 1);
        notifyComplete();
        return;
      }

      const startedAt = performance.now();
      const tick = (now: number) => {
        if (cancelled) {
          return;
        }
        const progress = Math.min(1, (now - startedAt) / durationMs);
        const fraction = Math.max(1 / walk.pointCount, easeInOutCubic(progress));
        painter.paintTo(fraction, fraction, { head: progress < 1 });

        if (progress < 1) {
          frameId = window.requestAnimationFrame(tick);
        } else {
          notifyComplete();
        }
      };
      frameId = window.requestAnimationFrame(tick);
    };

    // Generating a walk hashes hundreds of thousands of steps; keep it off the
    // hydration critical path by waiting for an idle moment (bounded to ~300ms).
    const startId = window.setTimeout(() => {
      if ("requestIdleCallback" in window) {
        idleId = window.requestIdleCallback(start, { timeout: 300 });
      } else {
        start();
      }
    }, 30);

    return () => {
      cancelled = true;
      painterRef.current = null;
      window.clearTimeout(startId);
      if (idleId && "cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
      window.cancelAnimationFrame(frameId);
    };
  }, [seed, drawKey, vert, background, durationMs, controlled]);

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
