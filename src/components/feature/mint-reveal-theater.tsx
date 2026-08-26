"use client";

import { useEffect, useState } from "react";

import { WalkCanvas } from "@/components/feature/walk-canvas";
import { Button } from "@/components/ui/button";
import { formatId } from "@/lib/utils";

/**
 * Post-mint reveal: while the backend renders the full-resolution media, the
 * browser draws the new work live from its actual on-chain seed — the wait
 * becomes the unveiling.
 */
export function MintRevealTheater({
  tokenId,
  seed,
  onView
}: {
  tokenId: number;
  seed: string;
  onView: () => void;
}) {
  const [drawingDone, setDrawingDone] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 overflow-y-auto bg-black/95 px-4 py-10 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Revealing your new work ${formatId(tokenId)}`}
      data-testid="mint-reveal-theater"
    >
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.32em] text-secondary">A new work enters the collection</p>
        <p className="mt-2 font-mono text-3xl font-semibold text-white sm:text-4xl">{formatId(tokenId)}</p>
      </div>

      <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 shadow-[0_0_80px_rgba(198,118,215,0.25)]">
        <WalkCanvas
          seed={seed}
          vert={300}
          durationMs={12_000}
          onComplete={() => setDrawingDone(true)}
          label={`Your new artwork ${formatId(tokenId)} drawing itself from its on-chain seed`}
        />
      </div>

      <p className="max-w-md text-center text-sm leading-6 text-white/60" aria-live="polite">
        {drawingDone
          ? "This walk was drawn live from your on-chain seed. The museum is rendering the full-resolution image and films — they appear on your work's page within minutes."
          : "Drawing your walk live from its on-chain seed — the same algorithm that renders the final artwork."}
      </p>

      <Button
        size="lg"
        variant={drawingDone ? "secondary" : "outline"}
        onClick={onView}
        autoFocus
        data-testid="mint-reveal-view"
      >
        {drawingDone ? "View your work in the collection" : "Skip to your work"}
      </Button>
    </div>
  );
}
