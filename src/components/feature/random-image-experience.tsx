"use client";

import Link from "next/link";
import type { Route } from "next";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createAssetUrls, formatId } from "@/lib/utils";
import { useRandomTokenHistory } from "@/lib/use-random-token-history";

export function RandomImageExperience({ initialTokenId }: { initialTokenId: number }) {
  const { currentTokenId, canGoBack, goBack, goNext } = useRandomTokenHistory(initialTokenId);

  // Token id 0 is valid; do not use !currentTokenId (0 is falsy).
  if (currentTokenId === undefined) return null;

  const assets = createAssetUrls(currentTokenId);

  return (
    <div
      className="relative min-h-[calc(100vh-12rem)]"
      style={{
        backgroundImage: `url(${assets.blackImage})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain"
      }}
    >
      <div className="absolute inset-x-0 bottom-10 flex items-center justify-center gap-3">
        <Button
          variant="outline"
          size="icon"
          disabled={!canGoBack}
          onClick={goBack}
          className="rounded-full border-border bg-background/70 backdrop-blur"
          aria-label="Previous image"
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
          onClick={() => void goNext()}
          className="rounded-full border-border bg-background/70 backdrop-blur"
          aria-label="Next random image"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
