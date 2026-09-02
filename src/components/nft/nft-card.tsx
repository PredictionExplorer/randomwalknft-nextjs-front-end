"use client";

import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createAssetUrls, formatId } from "@/lib/utils";

export function NftCard({
  id,
  image,
  href,
  label,
  sublabel,
  compact = false,
  hoverVideo = true
}: {
  id: number;
  image: string;
  href?: string;
  label?: string;
  /** Secondary badge line, e.g. a beauty rank. */
  sublabel?: string | undefined;
  compact?: boolean;
  /** Play the token's motion variant on hover/focus (loads only on demand). */
  hoverVideo?: boolean;
}) {
  const previewKey = `${id}:${image}`;
  const [failedPreviewKey, setFailedPreviewKey] = useState<string | null>(null);
  const [hovering, setHovering] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const imageFailed = failedPreviewKey === previewKey;
  const showVideo = hoverVideo && hovering && !imageFailed;

  const content = (
    <Card
      className="group overflow-hidden"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => {
        setHovering(false);
        setVideoReady(false);
      }}
    >
      <CardContent className="relative p-0">
        <div className={`relative overflow-hidden ${compact ? "aspect-square" : "aspect-[1.6/1]"}`}>
          {imageFailed ? (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted px-4 text-center"
              aria-hidden
            >
              <span className="font-mono text-lg text-muted-foreground">{formatId(id)}</span>
              <span className="text-xs text-muted-foreground/80">Preview not available yet</span>
            </div>
          ) : (
            <Image
              src={image}
              alt={`Random Walk NFT ${formatId(id)} — generative random walk artwork from an on-chain seed`}
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
              sizes={
                compact
                  ? "(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                  : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              }
              unoptimized
              onError={() => setFailedPreviewKey(previewKey)}
            />
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
              <source src={createAssetUrls(id).blackSingleVideo} type="video/mp4" />
            </video>
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />
          <div
            className={`pointer-events-none absolute flex items-center gap-2 ${compact ? "bottom-3 left-3" : "bottom-4 left-4"}`}
          >
            <Badge variant="secondary">{label ?? formatId(id)}</Badge>
            {sublabel ? <Badge variant="muted">{sublabel}</Badge> : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return href ? <Link href={href as Route}>{content}</Link> : content;
}
