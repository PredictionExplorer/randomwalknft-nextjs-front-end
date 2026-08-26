"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

import { WalkCanvas } from "@/components/feature/walk-canvas";
import { Button } from "@/components/ui/button";

/**
 * The Atelier: a live demonstration of the generator. Each draw runs the real
 * algorithm (SHA3-256 bit stream, four-direction walk, drifting color channels)
 * on a fresh random seed at miniature resolution.
 */
export function AtelierStudio() {
  const [drawKey, setDrawKey] = useState(0);
  const [drawing, setDrawing] = useState(true);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-3xl border border-border/60 shadow-[0_0_60px_rgba(198,118,215,0.12)]">
        <WalkCanvas
          drawKey={drawKey}
          vert={280}
          durationMs={14_000}
          onComplete={() => setDrawing(false)}
          label="Live demonstration: a random walk artwork drawing itself point by point"
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {drawing ? "Drawing a walk from a fresh random seed…" : "Walk complete — every pixel placed by chance."}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setDrawing(true);
            setDrawKey((value) => value + 1);
          }}
          data-testid="atelier-redraw"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Draw another walk
        </Button>
      </div>
    </div>
  );
}
