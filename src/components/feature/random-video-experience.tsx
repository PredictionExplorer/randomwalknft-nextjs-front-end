"use client";

import type { Route } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Shuffle } from "lucide-react";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useArtworkAssets } from "@/lib/use-artwork-assets";
import { useRandomTokenHistory } from "@/lib/use-random-token-history";
import { formatId } from "@/lib/utils";

/** The screening room: one film after another, each chosen at random from the collection. */
export function RandomVideoExperience({ initialTokenId }: { initialTokenId?: number | undefined }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { currentTokenId, canGoBack, goBack, goNext } = useRandomTokenHistory(initialTokenId);
  const assets = useArtworkAssets(currentTokenId ?? initialTokenId ?? 0);

  const restart = () => {
    const video = videoRef.current;
    if (video) {
      video.load();
      void video.play();
    }
  };

  const handleNext = async () => {
    await goNext();
    restart();
  };

  // Token id 0 is valid; do not use !currentTokenId (0 is falsy).
  if (currentTokenId === undefined) {
    return <Skeleton className="aspect-[1.6/1] w-full" />;
  }

  return (
    <div className="space-y-4" data-testid="random-video">
      <div
        className="relative aspect-[1.6/1] max-h-[78svh] w-full overflow-hidden rounded-md border border-border"
        style={{ backgroundColor: "var(--artwork-backdrop)" }}
      >
        {/* Silent render: the films carry no audio track, so captions do not apply. */}
        <video
          ref={videoRef}
          key={assets.singleVideo}
          autoPlay
          muted
          playsInline
          controls
          poster={assets.thumb}
          className="absolute inset-0 h-full w-full object-contain"
          onEnded={() => void handleNext()}
        >
          <source src={assets.singleVideo} type="video/mp4" />
        </video>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/detail/${currentTokenId}` as Route}
          className="font-mono text-sm text-foreground hover:text-accent"
        >
          {formatId(currentTokenId)} <span className="text-muted-foreground">· open the work →</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!canGoBack}
            onClick={() => {
              goBack();
              restart();
            }}
            aria-label="Previous film"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </Button>
          <Button variant="default" size="sm" onClick={() => void handleNext()} data-testid="random-next">
            <Shuffle className="h-3.5 w-3.5" aria-hidden />
            Another film
          </Button>
          <Button variant="outline" size="sm" onClick={() => void handleNext()} aria-label="Next random film">
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
