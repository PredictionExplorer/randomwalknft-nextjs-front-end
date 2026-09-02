"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { describeDuration, splitDuration } from "@/lib/time";

export function Countdown({ seconds, onComplete }: { seconds: number; onComplete?: () => void }) {
  const [remaining, setRemaining] = useState(seconds);
  const [trackedSeconds, setTrackedSeconds] = useState(seconds);
  const completedRef = useRef(false);
  const handleComplete = useEffectEvent(() => onComplete?.());

  // A new `seconds` value (e.g. a fresh contract read) restarts the clock. Adjusting
  // state during render avoids an extra committed frame with the stale value.
  if (seconds !== trackedSeconds) {
    setTrackedSeconds(seconds);
    setRemaining(seconds);
  }

  useEffect(() => {
    if (remaining > 0) {
      // Counting again (fresh mount or a reset): arm completion for this run.
      completedRef.current = false;
      const timer = window.setTimeout(() => setRemaining((value) => value - 1), 1000);
      return () => window.clearTimeout(timer);
    }

    if (!completedRef.current) {
      completedRef.current = true;
      handleComplete();
    }
    return undefined;
  }, [remaining]);

  const parts = splitDuration(remaining);

  return (
    <div>
      <p className="sr-only">
        {remaining <= 0 ? "The countdown has finished." : `${describeDuration(remaining)} remain.`}
      </p>
      {/* Per-second digits are decorative for assistive tech; the summary above is stable. */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-hidden>
        {Object.entries(parts).map(([label, value]) => (
          <Card key={label}>
            <CardContent className="flex flex-col items-center justify-center gap-1 p-5">
              <span className="text-3xl font-semibold tabular-nums text-primary">{String(value).padStart(2, "0")}</span>
              <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{label}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
