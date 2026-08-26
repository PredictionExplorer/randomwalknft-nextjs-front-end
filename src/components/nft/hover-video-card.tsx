"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { useState } from "react";

import { createAssetUrls, formatId } from "@/lib/utils";

/**
 * Museum wall card: still thumbnail that comes alive on hover/focus by playing
 * the token's motion variant. The video only loads once the visitor hovers,
 * keeping the wall cheap to render.
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
  const assets = createAssetUrls(id);

  return (
    <Link
      href={`/detail/${id}` as Route}
      className="group relative block shrink-0 snap-start overflow-hidden rounded-2xl border border-border/60 bg-black transition hover:border-secondary/60"
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => {
        setActive(false);
        setVideoReady(false);
      }}
      onFocus={() => setActive(true)}
      onBlur={() => {
        setActive(false);
        setVideoReady(false);
      }}
    >
      <div className="relative aspect-[1.6/1] w-[16rem] sm:w-[18rem]">
        <Image
          src={assets.blackThumb}
          alt={`Random Walk NFT ${formatId(id)} — generative random walk artwork on a black background`}
          fill
          sizes="18rem"
          className="object-cover"
          unoptimized
          priority={priority}
        />
        {active ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            onPlaying={() => setVideoReady(true)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${videoReady ? "opacity-100" : "opacity-0"}`}
          >
            <source src={assets.blackSingleVideo} type="video/mp4" />
          </video>
        ) : null}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
          <p className="font-mono text-xs text-white/90">{label ?? formatId(id)}</p>
          {sublabel ? <p className="mt-0.5 text-[0.65rem] uppercase tracking-[0.2em] text-white/60">{sublabel}</p> : null}
        </div>
      </div>
    </Link>
  );
}
