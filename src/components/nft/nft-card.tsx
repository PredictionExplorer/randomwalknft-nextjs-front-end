"use client";

import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { ArtworkTransition } from "@/components/common/view-transition";
import { Badge } from "@/components/ui/badge";
import type { AssetTheme } from "@/lib/types";
import { useArtworkAssets } from "@/lib/use-artwork-assets";
import { cn, formatId } from "@/lib/utils";

export function NftCard({
  id,
  href,
  label,
  sublabel,
  compact = false,
  hoverVideo = true,
  edition,
  priority = false,
  className
}: {
  id: number;
  href?: string;
  label?: string;
  /** Secondary badge line, e.g. a beauty rank. */
  sublabel?: string | undefined;
  compact?: boolean;
  /** Play the token's film on hover/focus (loads only on demand). */
  hoverVideo?: boolean;
  /** Force an edition instead of following the wing. */
  edition?: AssetTheme | undefined;
  priority?: boolean;
  className?: string;
}) {
  const assets = useArtworkAssets(id, edition);
  const previewKey = `${id}:${assets.thumb}`;
  const [failedPreviewKey, setFailedPreviewKey] = useState<string | null>(null);
  const [engaged, setEngaged] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const imageFailed = failedPreviewKey === previewKey;
  const showVideo = hoverVideo && engaged && !imageFailed;

  const engage = () => setEngaged(true);
  const disengage = () => {
    setEngaged(false);
    setVideoReady(false);
  };

  const content = (
    <div
      className={cn(
        "group relative overflow-hidden rounded-md border border-border transition-colors",
        href && "hover:border-border-strong",
        className
      )}
      style={{ backgroundColor: "var(--artwork-backdrop)" }}
    >
      <div className={cn("relative overflow-hidden", compact ? "aspect-square" : "aspect-[1.6/1]")}>
        {imageFailed ? (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted px-4 text-center"
            aria-hidden
          >
            <span className="font-mono text-lg text-muted-foreground">{formatId(id)}</span>
            <span className="text-xs text-muted-foreground/80">Preview not available yet</span>
          </div>
        ) : (
          <ArtworkTransition tokenId={id}>
            <Image
              src={assets.thumb}
              alt={`Random Walk NFT ${formatId(id)} — generative random walk artwork, ${assets.edition} edition`}
              fill
              className="object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.02]"
              sizes={
                compact
                  ? "(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                  : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              }
              unoptimized
              priority={priority}
              onError={() => setFailedPreviewKey(previewKey)}
            />
          </ArtworkTransition>
        )}
        {showVideo ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            onPlaying={() => setVideoReady(true)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${videoReady ? "opacity-100" : "opacity-0"}`}
            aria-hidden
          >
            <source src={assets.singleVideo} type="video/mp4" />
          </video>
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div
          className={cn(
            "pointer-events-none absolute flex items-center gap-2",
            compact ? "bottom-3 left-3" : "bottom-4 left-4"
          )}
        >
          <Badge className="border-white/20 bg-black/55 text-white">{label ?? formatId(id)}</Badge>
          {sublabel ? <Badge className="border-white/15 bg-black/45 text-white/80">{sublabel}</Badge> : null}
        </div>
      </div>
    </div>
  );

  // The film preview is a hover/focus enhancement, so it lives on the interactive link only.
  return href ? (
    <Link
      href={href as Route}
      className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      onMouseEnter={engage}
      onMouseLeave={disengage}
      onFocus={engage}
      onBlur={disengage}
    >
      {content}
    </Link>
  ) : (
    content
  );
}
