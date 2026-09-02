"use client";

import { useState } from "react";

import { WalkCanvas } from "@/components/feature/walk-canvas";
import { useWingEdition } from "@/components/providers/wing-provider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { formatId } from "@/lib/utils";

/**
 * Post-mint reveal: while the backend renders the full-resolution media, the
 * browser draws the new work live from its actual on-chain seed — the wait
 * becomes the unveiling. A real dialog, so focus and Escape behave.
 */
export function MintRevealTheater({ tokenId, seed, onView }: { tokenId: number; seed: string; onView: () => void }) {
  const [drawingDone, setDrawingDone] = useState(false);
  const edition = useWingEdition();

  return (
    <Dialog open onOpenChange={(open) => (open ? undefined : onView())}>
      <DialogContent
        className="max-h-[94svh] w-[min(96vw,64rem)] overflow-y-auto border-border p-0"
        style={{ backgroundColor: edition === "white" ? "#ffffff" : "#000000" }}
        data-testid="mint-reveal-theater"
      >
        <div className="p-5 text-center sm:p-6">
          <DialogTitle className="eyebrow text-accent">A new work enters the collection</DialogTitle>
          <p
            className={`font-display mt-3 text-4xl leading-none sm:text-6xl ${edition === "white" ? "text-black" : "text-white"}`}
          >
            {formatId(tokenId)}
          </p>
        </div>

        <div className="flex justify-center">
          <WalkCanvas
            seed={seed}
            vert={300}
            durationMs={12_000}
            background={edition}
            onComplete={() => setDrawingDone(true)}
            label={`Your new artwork ${formatId(tokenId)} drawing itself from its on-chain seed`}
            className="max-h-[48svh] w-auto"
          />
        </div>

        <div className="space-y-4 p-5 text-center sm:p-6">
          <p
            className={`break-all font-mono text-[0.65rem] ${edition === "white" ? "text-black/50" : "text-white/50"}`}
          >
            {seed}
          </p>
          <DialogDescription
            className={`mx-auto max-w-md text-sm leading-6 ${edition === "white" ? "text-black/70" : "text-white/70"}`}
            aria-live="polite"
          >
            {drawingDone
              ? "This walk was drawn live from your on-chain seed. The museum is rendering the full-resolution image and films — they appear on your work's page within minutes."
              : "Drawing your walk live from its on-chain seed — the same algorithm that renders the final artwork."}
          </DialogDescription>
          <Button
            size="lg"
            variant={drawingDone ? "accent" : "outline"}
            onClick={onView}
            data-testid="mint-reveal-view"
          >
            {drawingDone ? "View your work in the collection" : "Skip to your work"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
