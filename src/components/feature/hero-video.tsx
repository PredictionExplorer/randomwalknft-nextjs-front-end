"use client";

import { useCallback, useRef, useState } from "react";

import { createAssetUrls } from "@/lib/utils";

export function HeroVideo({ initialTokenId }: { initialTokenId: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState(createAssetUrls(initialTokenId).blackTripleVideo);

  const handleEnded = useCallback(async () => {
    try {
      const response = await fetch("/api/random-token");
      if (!response.ok) return;

      const ids: unknown = await response.json();
      if (!Array.isArray(ids) || ids.length === 0) return;

      const randomId = ids[Math.floor(Math.random() * ids.length)] as number;
      const nextSrc = createAssetUrls(randomId).blackTripleVideo;

      setSrc(nextSrc);

      const video = videoRef.current;
      if (video) {
        video.load();
        void video.play();
      }
    } catch {
      videoRef.current?.play();
    }
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      onEnded={() => void handleEnded()}
      className="absolute left-1/2 top-0 h-auto min-w-full -translate-x-1/2 object-cover opacity-55"
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
