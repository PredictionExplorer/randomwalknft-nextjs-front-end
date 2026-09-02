"use client";

import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Shuffle } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { useArtworkAssets } from "@/lib/use-artwork-assets";
import { useRandomTokenHistory } from "@/lib/use-random-token-history";
import { formatId } from "@/lib/utils";

/** A single work, hung alone, with a shuffle. Arrow keys move through the visit's history. */
export function RandomImageExperience({ initialTokenId }: { initialTokenId: number }) {
  const { currentTokenId, canGoBack, goBack, goNext } = useRandomTokenHistory(initialTokenId);
  // Token id 0 is valid; keep the hook order stable by falling back before returning null.
  const assets = useArtworkAssets(currentTokenId ?? initialTokenId);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof Element && event.target.closest("input, textarea, select, [role=dialog]")) return;
      if (event.key === "ArrowRight" || event.key === " ") {
        event.preventDefault();
        void goNext();
      } else if (event.key === "ArrowLeft" && canGoBack) {
        goBack();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [canGoBack, goBack, goNext]);

  if (currentTokenId === undefined) return null;

  return (
    <div className="space-y-4" data-testid="random-image">
      <div
        className="relative aspect-[1.6/1] max-h-[78svh] w-full overflow-hidden rounded-md border border-border"
        style={{ backgroundColor: "var(--artwork-backdrop)" }}
      >
        <Image
          key={assets.image}
          src={assets.image}
          alt={`Random Walk NFT ${formatId(currentTokenId)}, ${assets.edition} edition`}
          fill
          sizes="(max-width: 1280px) 100vw, 1200px"
          className="object-contain"
          priority
          unoptimized
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/detail/${currentTokenId}` as Route}
          className="font-mono text-sm text-foreground hover:text-accent"
        >
          {formatId(currentTokenId)} <span className="text-muted-foreground">· open the work →</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={!canGoBack} onClick={goBack} aria-label="Previous work">
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </Button>
          <Button variant="default" size="sm" onClick={() => void goNext()} data-testid="random-next">
            <Shuffle className="h-3.5 w-3.5" aria-hidden />
            Another
            <kbd className="ml-1 hidden font-mono text-[0.6rem] opacity-60 sm:inline">→</kbd>
          </Button>
          <Button variant="outline" size="sm" onClick={() => void goNext()} aria-label="Next random work">
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
