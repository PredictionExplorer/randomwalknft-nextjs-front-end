"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import * as m from "motion/react-m";
import { useEffect, useEffectEvent, useRef, useState } from "react";

import { WalkCanvas, type WalkCanvasHandle } from "@/components/feature/walk-canvas";
import { useWingEdition } from "@/components/providers/wing-provider";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { cameraSpring } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { STORY_FINAL_FRAME, storyFrameAt, type StoryFrame } from "@/lib/walk/story-timeline";
import type { GeneratedWalk } from "@/lib/walk/walk-engine";
import { sampleChannel, stepBits } from "@/lib/walk/walk-painter";

const SEED_CHARS = 66; // "0x" + 64 hex digits
const BITS_WINDOW = 10;
const CHANNEL_COLORS = ["#ff6b6b", "#7bd88f", "#6ea8ff"] as const;

type Chapter = {
  eyebrow: string;
  title: string;
  body: string;
};

const STORY_CHAPTERS: Chapter[] = [
  {
    eyebrow: "Chapter I · The seed",
    title: "Every walk begins with a seed.",
    body: "When you mint, your transaction produces 32 bytes of randomness that are written to Arbitrum and never change. That seed is the only input. Everything you are about to see is derived from it, and anyone can derive it again."
  },
  {
    eyebrow: "Chapter II · The steps",
    title: "SHA3-256 turns the seed into steps.",
    body: "The seed is hashed again and again into an endless stream of bits. Every two bits become one step: right, left, down, or up. The walker never plans a route. It only listens to the next two bits."
  },
  {
    eyebrow: "Chapter III · The colour",
    title: "Three colours drift alongside.",
    body: "Three more streams of bits nudge red, green, and blue up or down at every step. Shape and palette are born together from the same randomness, so no two walks share a colour story."
  },
  {
    eyebrow: "Chapter IV · The frame",
    title: "…until it fills the frame.",
    body: "When the walk spans the canvas it stops and is framed. This one exists only in your browser. {count} like it exist forever on-chain, and the next one will be drawn from a seed nobody has ever seen."
  }
];

type WalkStoryProps = {
  mintedCount: number;
};

type Overlay = {
  seed: string;
  seedChars: number;
  headIndex: number;
  chapter: StoryFrame["chapter"];
};

/**
 * The homepage story: a pinned stage where the real generator draws a walk as
 * the visitor scrolls, while four chapters of copy explain what is happening.
 * Copy is ordinary DOM in reading order; the stage is `aria-hidden` decoration
 * described once by the canvas label.
 */
export function WalkStory({ mintedCount }: WalkStoryProps) {
  const storyRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasHandle = useRef<WalkCanvasHandle | null>(null);
  const canvasSize = useRef({ width: 0, height: 0 });
  const stageSize = useRef({ width: 0, height: 0 });
  const edition = useWingEdition();
  const reducedMotion = useReducedMotion() ?? false;

  const [drawKey, setDrawKey] = useState(0);
  const [walk, setWalk] = useState<GeneratedWalk | null>(null);
  const [overlay, setOverlay] = useState<Overlay>({ seed: "", seedChars: 0, headIndex: 0, chapter: 0 });
  /** Canvas width that fills the stage in one dimension without cropping the work. */
  const [fitWidth, setFitWidth] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({ target: storyRef, offset: ["start start", "end end"] });
  const zoom = useMotionValue(1);
  const cameraX = useMotionValue(0);
  const cameraY = useMotionValue(0);
  const colorProgress = useMotionValue(0);
  const scale = useSpring(zoom, cameraSpring);
  const x = useSpring(cameraX, cameraSpring);
  const y = useSpring(cameraY, cameraSpring);
  const plateOpacity = useTransform(scrollYProgress, [0.8, 0.92], [0, 1]);
  const playheadLeft = useTransform(colorProgress, (value) => `${value * 100}%`);

  function applyFrame(frame: StoryFrame, currentWalk: GeneratedWalk | null) {
    const handle = canvasHandle.current;
    if (!handle || !currentWalk) {
      return;
    }
    handle.paintTo(frame.draw, frame.color);
    colorProgress.set(frame.color);

    const nextHead = Math.round(frame.draw * (currentWalk.pointCount - 1));
    const nextChars = Math.round(frame.seed * SEED_CHARS);
    setOverlay((current) => {
      const headMoved = Math.abs(current.headIndex - nextHead) > currentWalk.pointCount / 240;
      if (!headMoved && current.seedChars === nextChars && current.chapter === frame.chapter) {
        return current;
      }
      return {
        ...current,
        headIndex: headMoved ? nextHead : current.headIndex,
        seedChars: nextChars,
        chapter: frame.chapter
      };
    });

    // Camera: keep the walker's head centred while zoomed in, settle to the full frame.
    const { width: cw, height: ch } = canvasSize.current;
    const { width: sw, height: sh } = stageSize.current;
    if (frame.zoom > 1.001 && cw > 0 && ch > 0) {
      const head = handle.headPosition();
      const offsetX = -frame.zoom * (head.x / currentWalk.width - 0.5) * cw;
      const offsetY = -frame.zoom * (head.y / currentWalk.height - 0.5) * ch;
      const maxX = Math.max(0, (frame.zoom * cw - sw) / 2);
      const maxY = Math.max(0, (frame.zoom * ch - sh) / 2);
      cameraX.set(Math.max(-maxX, Math.min(maxX, offsetX)));
      cameraY.set(Math.max(-maxY, Math.min(maxY, offsetY)));
    } else {
      cameraX.set(0);
      cameraY.set(0);
    }
    zoom.set(frame.zoom);
  }

  const onProgress = useEffectEvent((progress: number) => {
    applyFrame(reducedMotion ? STORY_FINAL_FRAME : storyFrameAt(progress), walk);
  });

  // Scroll drives the drawing directly on the canvas; React only re-renders for coarse overlay changes.
  useEffect(() => scrollYProgress.on("change", onProgress), [scrollYProgress]);

  // Size the canvas to the stage and track both for the camera without per-frame layout reads.
  const aspect = walk ? walk.width / walk.height : 1.566;
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const canvas = stage.querySelector("canvas");
    const observer = new ResizeObserver(() => {
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      stageSize.current = { width, height };
      // Leave a little air around the frame so the plate never touches the edge.
      setFitWidth(Math.floor(Math.min(width * 0.92, height * 0.9 * aspect)));
      if (canvas) {
        canvasSize.current = { width: canvas.clientWidth, height: canvas.clientHeight };
      }
    });
    observer.observe(stage);
    if (canvas) observer.observe(canvas);
    return () => observer.disconnect();
  }, [drawKey, aspect]);

  function handleWalk(nextWalk: GeneratedWalk, usedSeed: string) {
    setWalk(nextWalk);
    setOverlay({ seed: usedSeed, seedChars: 0, headIndex: 0, chapter: 0 });
    // Paint whatever the current scroll position asks for (e.g. a reload mid-story).
    applyFrame(reducedMotion ? STORY_FINAL_FRAME : storyFrameAt(scrollYProgress.get()), nextWalk);
  }

  function redraw() {
    trackEvent("atelier_draw", { source: "redraw", surface: "homepage" });
    setWalk(null);
    setDrawKey((value) => value + 1);
  }

  const channels = walk ? [sampleChannel(walk, 0), sampleChannel(walk, 1), sampleChannel(walk, 2)] : null;
  const bits = walk
    ? Array.from({ length: BITS_WINDOW }, (_, offset) => stepBits(walk, overlay.headIndex - (BITS_WINDOW - 1 - offset)))
    : [];
  const shortSeed = overlay.seed ? `${overlay.seed.slice(0, 10)}…${overlay.seed.slice(-6)}` : "";
  const light = edition === "white";
  const inkFaint = light ? "text-black/50" : "text-white/50";
  const ink = light ? "text-black/80" : "text-white/90";

  return (
    <section ref={storyRef} aria-labelledby="walk-story-heading" className="relative" data-testid="walk-story">
      <h2 id="walk-story-heading" className="sr-only">
        How a Random Walk is born
      </h2>

      <div className="lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* Stage */}
        <div className="sticky top-16 z-10 lg:order-2 lg:h-[calc(100svh-4rem)]">
          <div
            ref={stageRef}
            className="relative h-[46svh] overflow-hidden border-b border-border lg:h-full lg:border-b-0 lg:border-l"
            style={{ backgroundColor: light ? "#ffffff" : "#000000" }}
            aria-hidden
          >
            <m.div
              className="absolute inset-0 flex items-center justify-center"
              style={{ scale, x, y }}
              data-testid="walk-story-camera"
            >
              <div style={fitWidth ? { width: fitWidth } : { width: "92%" }}>
                <WalkCanvas
                  key={drawKey}
                  drawKey={drawKey}
                  vert={300}
                  durationMs={0}
                  background={edition}
                  handle={canvasHandle}
                  onWalk={handleWalk}
                  label="A random walk artwork drawing itself as you scroll"
                />
              </div>
            </m.div>

            {/* Chapter I: the seed types itself in */}
            <div
              className={cn(
                "pointer-events-none absolute inset-x-0 bottom-0 p-4 transition-opacity duration-500 sm:p-6",
                overlay.chapter === 0 ? "opacity-100" : "opacity-0"
              )}
            >
              <p className={cn("font-mono text-[0.65rem] uppercase tracking-[0.22em]", inkFaint)}>seed</p>
              <p className={cn("mt-1 break-all font-mono text-xs leading-5 sm:text-sm", ink)}>
                {overlay.seed.slice(0, overlay.seedChars)}
                <span className="animate-pulse-soft">▌</span>
              </p>
            </div>

            {/* Chapter II: the bit stream becomes steps */}
            <div
              className={cn(
                "pointer-events-none absolute inset-x-0 bottom-0 p-4 transition-opacity duration-500 sm:p-6",
                overlay.chapter === 1 ? "opacity-100" : "opacity-0"
              )}
            >
              <p className={cn("font-mono text-[0.65rem] uppercase tracking-[0.22em]", inkFaint)}>bits → step</p>
              <p className={cn("mt-1 flex flex-wrap gap-x-3 font-mono text-sm", ink)}>
                {bits.map((step, index) => (
                  <span key={index} className={index === bits.length - 1 ? "text-accent" : undefined}>
                    {step ? `${step.bits}${step.arrow}` : "··"}
                  </span>
                ))}
              </p>
            </div>

            {/* Chapter III: three colour channels with a playhead */}
            <div
              className={cn(
                "pointer-events-none absolute inset-x-0 bottom-0 p-4 transition-opacity duration-500 sm:p-6",
                overlay.chapter === 2 ? "opacity-100" : "opacity-0"
              )}
            >
              <p className={cn("font-mono text-[0.65rem] uppercase tracking-[0.22em]", inkFaint)}>
                red · green · blue drift
              </p>
              <div className="relative mt-2 h-9 w-full max-w-md sm:h-14">
                {channels ? (
                  <svg viewBox="0 0 160 40" preserveAspectRatio="none" className="h-full w-full">
                    {channels.map((series, channelIndex) => (
                      <polyline
                        key={channelIndex}
                        fill="none"
                        stroke={CHANNEL_COLORS[channelIndex]}
                        strokeWidth="1"
                        vectorEffect="non-scaling-stroke"
                        points={series.map((value, i) => `${i},${40 - value * 38 - 1}`).join(" ")}
                      />
                    ))}
                  </svg>
                ) : null}
                <m.div
                  className={cn("absolute inset-y-0 w-px", light ? "bg-black/70" : "bg-white/80")}
                  style={{ left: playheadLeft }}
                />
              </div>
            </div>

            {/* Chapter IV: the plate */}
            <m.div className="pointer-events-none absolute inset-0" style={{ opacity: plateOpacity }}>
              <div className="absolute inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-6">
                <p className={cn("font-mono text-[0.65rem] uppercase tracking-[0.22em]", inkFaint)}>
                  Untitled walk · not minted
                </p>
                <p className={cn("mt-1 font-mono text-xs", ink)}>{shortSeed}</p>
              </div>
            </m.div>
          </div>
        </div>

        {/* Chapters */}
        <div className="lg:order-1">
          {STORY_CHAPTERS.map((chapter, index) => (
            <article
              key={chapter.title}
              // Each chapter owns one viewport of scroll: the space under the mobile stage, a full column on desktop.
              className="flex min-h-[calc(54svh-4rem)] flex-col justify-center px-4 py-12 sm:px-6 lg:min-h-[calc(100svh-4rem)] lg:px-8"
              data-chapter={index}
            >
              <p className="eyebrow text-accent">{chapter.eyebrow}</p>
              <h3 className="font-display mt-4 text-balance text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
                {chapter.title}
              </h3>
              <p className="mt-6 max-w-lg text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                {chapter.body.replace("{count}", mintedCount.toLocaleString())}
              </p>
              {index === STORY_CHAPTERS.length - 1 ? (
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button variant="outline" onClick={redraw} data-testid="story-redraw">
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                    Draw another
                  </Button>
                  <Button asChild variant="ghost">
                    <Link href="/atelier">Open the Atelier</Link>
                  </Button>
                  <Button asChild variant="accent">
                    <Link href="/mint">Mint a real one</Link>
                  </Button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
