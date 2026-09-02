"use client";

import Image from "next/image";
import { Film, Image as ImageIcon, Maximize2, Play, Sparkles, ZoomIn } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ArtworkTransition } from "@/components/common/view-transition";
import { useMediaAvailability } from "@/components/detail/media-availability";
import { WalkCanvas } from "@/components/feature/walk-canvas";
import { useWingEdition } from "@/components/providers/wing-provider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { AssetTheme, AssetVariant, NftAssetUrls } from "@/lib/types";
import { cn, formatId, getAssetBySelection, getAssetPreview } from "@/lib/utils";

const mediaLabels: Record<AssetVariant, string> = {
  image: "Still",
  singleVideo: "Single walker",
  tripleVideo: "Triple walker"
};

type ArtworkStageProps = {
  tokenId: number;
  seed: string;
  assets: NftAssetUrls;
  /** True when the token exists on-chain but its files are still rendering. */
  pending: boolean;
  initialEdition?: AssetTheme | undefined;
  initialMedia?: AssetVariant | undefined;
};

/**
 * The work itself, as large as the viewport allows. Switch between the still and
 * the two films, flip editions, zoom, go fullscreen, or redraw the walk live from
 * the on-chain seed to see that the render really is derived from it.
 */
export function ArtworkStage({
  tokenId,
  seed,
  assets,
  pending,
  initialEdition,
  initialMedia = "image"
}: ArtworkStageProps) {
  const wingEdition = useWingEdition();
  const [editionOverride, setEditionOverride] = useState<AssetTheme | null>(initialEdition ?? null);
  const edition = editionOverride ?? wingEdition;
  const [requestedMedia, setRequestedMedia] = useState<AssetVariant>(initialMedia);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [proof, setProof] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  const availability = useMediaAvailability(assets, edition, pending);
  // Visitors may request a film that is still rendering; fall back to the still.
  const media: AssetVariant = availability[requestedMedia] ? requestedMedia : "image";
  const source = getAssetBySelection(assets, edition, media);
  const poster = getAssetPreview(assets, edition);
  const allReady = availability.image && availability.singleVideo && availability.tripleVideo;

  // Keyboard: I = immersive, Z = zoom, 1/2/3 = media. Ignored while typing in a field.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const typing =
        event.target instanceof Element &&
        event.target.closest("input, textarea, select, [contenteditable=true], [role=dialog]") !== null;
      if (typing || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      if (event.key === "i" || event.key === "I") {
        void stageRef.current?.requestFullscreen?.();
      } else if (event.key === "z" || event.key === "Z") {
        setZoomOpen(true);
      } else if (event.key === "1") {
        setRequestedMedia("image");
      } else if (event.key === "2") {
        setRequestedMedia("singleVideo");
      } else if (event.key === "3") {
        setRequestedMedia("tripleVideo");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <section aria-label={`Artwork ${formatId(tokenId)}`} className="space-y-4" data-testid="artwork-stage">
      <div
        ref={stageRef}
        className="relative overflow-hidden rounded-md border border-border"
        style={{ backgroundColor: edition === "white" ? "#ffffff" : "#000000" }}
      >
        <div className={cn("grid", proof ? "md:grid-cols-2" : "grid-cols-1")}>
          <div className="relative aspect-[1.6/1] max-h-[78svh] w-full">
            {media === "image" ? (
              <ArtworkTransition tokenId={tokenId}>
                <button
                  type="button"
                  onClick={() => availability.image && setZoomOpen(true)}
                  disabled={!availability.image}
                  className="group absolute inset-0 block cursor-zoom-in disabled:cursor-default"
                  aria-label={availability.image ? "Zoom into the still image" : "Still image is still rendering"}
                >
                  <Image
                    src={availability.image ? source : poster}
                    alt={`Random Walk NFT ${formatId(tokenId)}, ${edition} edition`}
                    fill
                    sizes="(max-width: 1280px) 100vw, 1200px"
                    className="object-contain"
                    priority
                    unoptimized
                  />
                  <span className="pointer-events-none absolute bottom-3 right-3 rounded-sm bg-black/55 p-1.5 text-white/80 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    <ZoomIn className="h-4 w-4" aria-hidden />
                  </span>
                </button>
              </ArtworkTransition>
            ) : (
              /* The films are silent renders (no audio track), so captions do not apply. */
              <video
                key={source}
                autoPlay
                muted
                loop
                playsInline
                controls
                poster={poster}
                className="absolute inset-0 h-full w-full object-contain"
                data-testid="artwork-video"
              >
                <source src={source} type="video/mp4" />
              </video>
            )}
          </div>

          {proof ? (
            <div className="relative border-t border-border md:border-l md:border-t-0">
              <WalkCanvas
                seed={seed}
                vert={300}
                durationMs={10_000}
                background={edition}
                label={`Live redraw of ${formatId(tokenId)} from its on-chain seed`}
                className="max-h-[78svh]"
              />
              <p
                className={cn(
                  "pointer-events-none absolute bottom-3 left-3 font-mono text-[0.6rem] uppercase tracking-[0.2em]",
                  edition === "white" ? "text-black/60" : "text-white/60"
                )}
              >
                Drawn live from the seed
              </p>
            </div>
          ) : null}
        </div>

        {pending && !allReady ? (
          <p
            className="absolute left-3 top-3 rounded-sm border border-accent/50 bg-black/60 px-2 py-1 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-accent"
            role="status"
          >
            Rendering · films appear within minutes
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Media">
          {(["image", "singleVideo", "tripleVideo"] as const).map((variant) => {
            const Icon = variant === "image" ? ImageIcon : variant === "singleVideo" ? Play : Film;
            return (
              <Button
                key={variant}
                size="sm"
                variant={media === variant ? "default" : "outline"}
                aria-pressed={media === variant}
                disabled={!availability[variant]}
                onClick={() => setRequestedMedia(variant)}
                data-testid={`media-${variant}`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                {mediaLabels[variant]}
              </Button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex rounded-md border border-border p-0.5" role="group" aria-label="Edition">
            {(["black", "white"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setEditionOverride(value)}
                aria-pressed={edition === value}
                className={cn(
                  "rounded-sm px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.16em] transition-colors",
                  edition === value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {value} edition
              </button>
            ))}
          </div>
          <Button
            size="sm"
            variant={proof ? "default" : "outline"}
            aria-pressed={proof}
            onClick={() => setProof((v) => !v)}
            data-testid="proof-toggle"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Redraw from seed
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => void stageRef.current?.requestFullscreen?.()}
            title="Immersive (I)"
          >
            <Maximize2 className="h-3.5 w-3.5" aria-hidden />
            Immersive
          </Button>
        </div>
      </div>

      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent
          className="w-[min(96vw,90rem)] p-2"
          style={{ backgroundColor: edition === "white" ? "#ffffff" : "#000000" }}
        >
          <DialogTitle className="sr-only">Full-size still of {formatId(tokenId)}</DialogTitle>
          <Image
            src={getAssetBySelection(assets, edition, "image")}
            alt={`Full-size Random Walk NFT ${formatId(tokenId)}, ${edition} edition`}
            width={1600}
            height={1000}
            className="h-auto max-h-[88vh] w-full object-contain"
            unoptimized
          />
        </DialogContent>
      </Dialog>
    </section>
  );
}
