"use client";

import { useCallback, useRef, useState } from "react";

import { createAssetUrls } from "@/lib/utils";

export function HeroVideo({ initialTokenId }: { initialTokenId: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [tokenId, setTokenId] = useState(initialTokenId);

  const handleEnded = useCallback(async () => {
    try {
      const response = await fetch(`/api/random-token?exclude=${tokenId}`);
      if (!response.ok) return;

      const data = (await response.json()) as { tokenId: number; totalSupply: number };
      if (data.totalSupply <= 0) return;

      setTokenId(data.tokenId);

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
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      onEnded={() => void handleEnded()}
      className="absolute left-1/2 top-0 h-auto min-w-full -translate-x-1/2 object-cover opacity-55"
    >
      <source src={assets.blackTripleVideo} type="video/mp4" />
    </video>
  );
}
