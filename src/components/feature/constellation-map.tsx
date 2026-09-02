"use client";

import type { Route } from "next";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "motion/react";
import { useEffect, useEffectEvent, useRef, useState } from "react";

import { useWingEdition } from "@/components/providers/wing-provider";
import { useArtworkAssets } from "@/lib/use-artwork-assets";
import { cn, formatId } from "@/lib/utils";
import {
  beautyRankOf,
  layoutConstellation,
  nearestPoint,
  type ConstellationLayout,
  type ConstellationPoint
} from "@/lib/walk/constellation";

type ConstellationMapProps = {
  count: number;
  /** Worst-first beauty order from the API. */
  beautyOrder: number[];
  /** Ids to ring: the newest mint (keyholder's work) and today's picks. */
  newestId?: number | undefined;
  featuredIds?: number[] | undefined;
  className?: string;
};

const HOVER_RADIUS = 0.035;

/**
 * Every work in the collection as a point of light. Scroll-free, hover to see a
 * work, click to visit it. Purely decorative for assistive technology; the wall
 * rows beside it list the same works as real links.
 */
export function ConstellationMap({ count, beautyOrder, newestId, featuredIds = [], className }: ConstellationMapProps) {
  const router = useRouter();
  const edition = useWingEdition();
  const reducedMotion = useReducedMotion() ?? false;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<ConstellationPoint[]>([]);
  const [layout, setLayout] = useState<ConstellationLayout>("mint");
  const [hovered, setHovered] = useState<ConstellationPoint | null>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

  const draw = useEffectEvent((hoveredId: number | null, pulse: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const dpr = window.devicePixelRatio || 1;
    const size = canvas.clientWidth;
    if (canvas.width !== size * dpr) {
      canvas.width = size * dpr;
      canvas.height = size * dpr;
    }
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, size, size);

    const light = edition === "white";
    const dot = light ? "rgba(17,17,16,0.55)" : "rgba(242,239,233,0.55)";
    const radius = Math.max(0.9, size / 1100);
    const centre = size / 2;
    const scale = (size / 2) * 0.94;
    const featured = new Set(featuredIds);
    const beautyTop = new Set(beautyOrder.slice(-8));

    context.fillStyle = dot;
    for (const point of pointsRef.current) {
      const px = centre + point.x * scale;
      const py = centre + point.y * scale;
      context.beginPath();
      context.arc(px, py, radius, 0, Math.PI * 2);
      context.fill();
    }

    const ring = (id: number, stroke: string, extra: number) => {
      const point = pointsRef.current[id];
      if (!point) return;
      context.strokeStyle = stroke;
      context.lineWidth = 1;
      context.beginPath();
      context.arc(centre + point.x * scale, centre + point.y * scale, radius + extra, 0, Math.PI * 2);
      context.stroke();
    };
    for (const id of beautyTop) ring(id, light ? "rgba(17,17,16,0.9)" : "rgba(242,239,233,0.9)", 4);
    for (const id of featured) ring(id, light ? "rgba(17,17,16,0.5)" : "rgba(242,239,233,0.5)", 2.5);
    if (newestId !== undefined) {
      ring(newestId, "rgba(212,168,83,1)", 5 + pulse * 4);
      ring(newestId, "rgba(212,168,83,0.5)", 9 + pulse * 6);
    }
    if (hoveredId !== null) {
      ring(hoveredId, "rgba(212,168,83,1)", 6);
    }
  });

  // Layout is pure math; recompute when the arrangement changes.
  useEffect(() => {
    pointsRef.current = layoutConstellation(count, layout, beautyOrder);
    draw(null, 0);
  }, [count, layout, beautyOrder]);

  // Redraw on resize and wing change; pulse the newest work unless motion is reduced.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let frame = 0;
    const started = performance.now();
    const observer = new ResizeObserver(() => draw(hovered?.id ?? null, 0));
    observer.observe(canvas);
    if (!reducedMotion) {
      const tick = (now: number) => {
        const pulse = (Math.sin((now - started) / 900) + 1) / 2;
        draw(hovered?.id ?? null, pulse);
        frame = window.requestAnimationFrame(tick);
      };
      frame = window.requestAnimationFrame(tick);
    } else {
      draw(hovered?.id ?? null, 0);
    }
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [edition, hovered, reducedMotion]);

  function pointAt(event: { clientX: number; clientY: number; currentTarget: HTMLCanvasElement }) {
    const rect = event.currentTarget.getBoundingClientRect();
    const nx = ((event.clientX - rect.left) / rect.width - 0.5) / 0.47;
    const ny = ((event.clientY - rect.top) / rect.height - 0.5) / 0.47;
    return nearestPoint(pointsRef.current, nx, ny, HOVER_RADIUS);
  }

  return (
    <div className={cn("space-y-4", className)} data-testid="constellation">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="eyebrow">
          {count.toLocaleString()} works · {layout === "mint" ? "oldest at the centre" : "most beautiful at the centre"}
        </p>
        <div
          className="inline-flex rounded-md border border-border p-0.5"
          role="group"
          aria-label="Arrange the constellation"
        >
          {(
            [
              ["mint", "By mint order"],
              ["beauty", "By beauty"]
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setLayout(value)}
              aria-pressed={layout === value}
              className={cn(
                "rounded-sm px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.16em] transition-colors",
                layout === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div
        className="relative"
        role="img"
        aria-label={`Constellation of ${count.toLocaleString()} Random Walk works arranged ${layout === "mint" ? "by mint order" : "by beauty rank"}`}
      >
        <canvas
          ref={canvasRef}
          aria-hidden
          className="aspect-square w-full cursor-crosshair rounded-md border border-border"
          style={{ backgroundColor: "var(--artwork-backdrop)" }}
          onPointerMove={(event) => {
            const point = pointAt(event);
            setHovered(point);
            setCursor(point ? { x: event.nativeEvent.offsetX, y: event.nativeEvent.offsetY } : null);
          }}
          onPointerLeave={() => {
            setHovered(null);
            setCursor(null);
          }}
          onClick={(event) => {
            const point = pointAt(event);
            if (point) router.push(`/detail/${point.id}` as Route);
          }}
        />
        {hovered && cursor ? (
          <ConstellationTooltip point={hovered} cursor={cursor} beautyOrder={beautyOrder} newestId={newestId} />
        ) : null}
      </div>
    </div>
  );
}

function ConstellationTooltip({
  point,
  cursor,
  beautyOrder,
  newestId
}: {
  point: ConstellationPoint;
  cursor: { x: number; y: number };
  beautyOrder: number[];
  newestId: number | undefined;
}) {
  const assets = useArtworkAssets(point.id);
  const rank = beautyRankOf(point.id, beautyOrder);

  return (
    <div
      className="pointer-events-none absolute z-10 w-44 overflow-hidden rounded-md border border-border bg-popover shadow-[0_18px_50px_-20px_rgba(0,0,0,0.6)]"
      style={{ left: Math.min(cursor.x + 14, 9999), top: cursor.y + 14 }}
      role="status"
    >
      <div className="relative aspect-[1.6/1]" style={{ backgroundColor: "var(--artwork-backdrop)" }}>
        <Image src={assets.thumb} alt="" fill sizes="11rem" className="object-cover" unoptimized />
      </div>
      <div className="p-2.5">
        <p className="font-mono text-xs text-foreground">{formatId(point.id)}</p>
        <p className="mt-0.5 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground">
          {point.id === newestId ? "Newest · holds the key" : rank ? `Beauty rank #${rank}` : "Click to visit"}
        </p>
      </div>
    </div>
  );
}
