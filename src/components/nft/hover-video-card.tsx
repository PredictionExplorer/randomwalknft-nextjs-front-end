"use client";

import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { ArtworkTransition } from "@/components/common/view-transition";
import { useArtworkAssets } from "@/lib/use-artwork-assets";
import { formatId } from "@/lib/utils";

/**
 * Wall card: a still that comes alive on hover/focus by playing the token's
 * film. The video only loads once the visitor engages, keeping the wall cheap
 * to render. Follows the wing (black or white edition).
 */
export function HoverVideoCard({
  id,
  label,
  sublabel,
  priority = false
}: {
  id: number;
  /** Museum label line, defaults to the token id. */
  label?: string;
  /** Secondary label line, e.g. a beauty rank. */
  sublabel?: string | undefined;
  priority?: boolean;
}) {
  const [active, setActive] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const assets = useArtworkAssets(id);

  const activate = () => setActive(true);
  const deactivate = () => {
    setActive(false);
    setVideoReady(false);
  };

  return (
    <Link
      href={`/detail/${id}` as Route}
      className="group relative block shrink-0 snap-start overflow-hidden rounded-md border border-border transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{ backgroundColor: "var(--artwork-backdrop)" }}
      onMouseEnter={activate}
      onMouseLeave={deactivate}
      onFocus={activate}
      onBlur={deactivate}
    >
      <div className="relative aspect-[1.6/1] w-[16rem] sm:w-[18rem]">
        <ArtworkTransition tokenId={id}>
          <Image
            src={assets.thumb}
            alt={`Random Walk NFT ${formatId(id)} — generative random walk artwork, ${assets.edition} edition`}
            fill
            sizes="18rem"
            className="object-cover"
            unoptimized
            priority={priority}
          />
        </ArtworkTransition>
        {active ? (
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
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
          <p className="font-mono text-xs text-white/90">{label ?? formatId(id)}</p>
          {sublabel ? (
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-white/60">{sublabel}</p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
