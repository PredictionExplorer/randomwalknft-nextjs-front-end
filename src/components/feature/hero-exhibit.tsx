"use client";

import Link from "next/link";
import type { Route } from "next";
import { useCallback, useRef, useState, useSyncExternalStore } from "react";

import { createAssetUrls, formatId, shortenAddress } from "@/lib/utils";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onStoreChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onStoreChange);
  return () => query.removeEventListener("change", onStoreChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/**
 * The Entry Hall exhibit: a full-bleed motion artwork with a museum label.
 * When one film ends, another random work from the collection takes the wall.
 * Visitors who prefer reduced motion see the still artwork instead.
 */
export function HeroExhibit({
  initialTokenId,
  initialOwner
}: {
  initialTokenId: number;
  initialOwner?: string | undefined;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [tokenId, setTokenId] = useState(initialTokenId);
  const [owner, setOwner] = useState(initialOwner);
  // Server snapshot assumes motion so the film is in the SSR HTML; visitors
  // with reduced motion get the still swapped in on hydration.
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    () => false
  );

  const handleEnded = useCallback(async () => {
    try {
      const response = await fetch(`/api/random-token?exclude=${tokenId}`);
      if (!response.ok) return;

      const data = (await response.json()) as { tokenId: number; totalSupply: number };
      if (data.totalSupply <= 0) return;

      setTokenId(data.tokenId);
      setOwner(undefined);

      const video = videoRef.current;
      if (video) {
        video.load();
        void video.play();
      }
    } catch {
      videoRef.current?.play();
    }
  }, [tokenId]);

  const assets = createAssetUrls(tokenId);

  return (
    <>
      {reducedMotion ? (
        // eslint-disable-next-line @next/next/no-img-element -- full-bleed backdrop; unoptimized asset host
        <img
          src={assets.blackImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-80"
          aria-hidden
        />
      ) : (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          poster={assets.blackThumb}
          onEnded={() => void handleEnded()}
          className="absolute inset-0 h-full w-full object-cover opacity-80"
          aria-hidden
        >
          <source src={assets.blackTripleVideo} type="video/mp4" />
        </video>
      )}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.55)_0%,rgba(5,5,5,0.15)_35%,rgba(5,5,5,0.35)_70%,rgba(5,5,5,0.92)_100%)]" />

      <Link
        href={`/detail/${tokenId}` as Route}
        className="absolute bottom-6 right-6 z-10 hidden max-w-[15rem] rounded-xl border border-white/15 bg-black/55 p-4 backdrop-blur-md transition hover:border-secondary/60 md:block"
        data-testid="hero-exhibit-label"
      >
        <p className="text-[0.6rem] uppercase tracking-[0.3em] text-white/50">Now showing</p>
        <p className="mt-1 font-mono text-sm text-white">{formatId(tokenId)}</p>
        {owner ? (
          <p className="mt-1 truncate text-xs text-white/60">Collected by {shortenAddress(owner)}</p>
        ) : null}
        <p className="mt-1 text-[0.6rem] uppercase tracking-[0.2em] text-white/40">
          Triple walk film · CC0
        </p>
      </Link>
    </>
  );
}
