"use client";

import Link from "next/link";
import type { Route } from "next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { createAssetUrls, formatId } from "@/lib/utils";
import { useRandomTokenHistory } from "@/lib/use-random-token-history";

export function RandomVideoExperience() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { currentTokenId, canGoBack, goBack, goNext } = useRandomTokenHistory();

  const handleNext = async () => {
    await goNext();
    const video = videoRef.current;
    if (video) {
      video.load();
      void video.play();
    }
  };

  if (!currentTokenId) {
    return <Skeleton className="min-h-[calc(100vh-12rem)] w-full rounded-none" />;
  }

  const assets = createAssetUrls(currentTokenId);

  return (
    <div className="relative min-h-[calc(100vh-12rem)]">
      <div className="absolute inset-0 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="absolute left-1/2 top-1/2 h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover"
          onEnded={() => void handleNext()}
        >
          <source src={assets.blackSingleVideo} type="video/mp4" />
        </video>
      </div>

      <div className="absolute inset-x-0 bottom-10 flex items-center justify-center gap-3">
        <Button
          variant="outline"
          size="icon"
          disabled={!canGoBack}
          onClick={() => {
            goBack();
            const video = videoRef.current;
            if (video) {
              video.load();
              void video.play();
            }
          }}
          className="rounded-full border-border bg-background/70 backdrop-blur"
          aria-label="Previous video"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Link
          href={`/detail/${currentTokenId}` as Route}
          className="rounded-full border border-border bg-background/70 px-5 py-3 text-sm tracking-[0.2em] text-secondary backdrop-blur transition hover:bg-background/90"
        >
          {formatId(currentTokenId)}
        </Link>
        <Button
          variant="outline"
          size="icon"
          onClick={() => void handleNext()}
          className="rounded-full border-border bg-background/70 backdrop-blur"
          aria-label="Next random video"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
