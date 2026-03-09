"use client";

import { useEffect, useMemo, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";

function splitDuration(totalSeconds: number) {
  const clamped = Math.max(0, totalSeconds);
  const days = Math.floor(clamped / 86_400);
  const hours = Math.floor((clamped % 86_400) / 3_600);
  const minutes = Math.floor((clamped % 3_600) / 60);
  const seconds = clamped % 60;

  return { days, hours, minutes, seconds };
}

export function Countdown({
  seconds,
  onComplete
}: {
  seconds: number;
  onComplete?: () => void;
}) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) {
      onComplete?.();
      return;
    }

    const timer = window.setTimeout(() => setRemaining((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [onComplete, remaining]);

  const parts = useMemo(() => splitDuration(remaining), [remaining]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {Object.entries(parts).map(([label, value]) => (
        <Card key={label}>
          <CardContent className="flex flex-col items-center justify-center gap-1 p-5">
            <span className="text-3xl font-semibold text-primary">{value}</span>
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{label}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
