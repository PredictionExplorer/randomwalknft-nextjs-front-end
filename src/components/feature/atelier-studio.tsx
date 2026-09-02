"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Columns2, Download, RefreshCw, Shuffle } from "lucide-react";
import { useRef, useState } from "react";

import { WalkCanvas } from "@/components/feature/walk-canvas";
import { useWingEdition } from "@/components/providers/wing-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trackEvent } from "@/lib/analytics";
import type { AssetTheme } from "@/lib/types";
import { isSeedHex, randomSeedHex, seedFromInput } from "@/lib/walk/walk-engine";

const DRAW_DURATION_MS = 12_000;

type AtelierStudioProps = {
  /** Seed from the URL, if the visitor arrived through a shared link. */
  initialSeed?: string | undefined;
  /** Compact mode drops the seed input (used inside other pages). */
  compact?: boolean;
};

/**
 * The Atelier: the real generator, in the browser, under the visitor's control.
 * Paste a real seed, type any text (hashed to a seed), or roll a random one; watch
 * it draw in the current wing's edition or in both editions at once.
 */
export function AtelierStudio({ initialSeed, compact = false }: AtelierStudioProps) {
  const router = useRouter();
  const pathname = usePathname();
  const edition = useWingEdition();
  const [seed, setSeed] = useState(() =>
    initialSeed && isSeedHex(initialSeed) ? seedFromInput(initialSeed) : randomSeedHex()
  );
  const [input, setInput] = useState(initialSeed && isSeedHex(initialSeed) ? initialSeed : "");
  const [drawKey, setDrawKey] = useState(0);
  const [drawing, setDrawing] = useState(true);
  const [twin, setTwin] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  function startDraw(nextSeed: string, source: "random" | "input" | "redraw") {
    setSeed(nextSeed);
    setDrawing(true);
    setDrawKey((value) => value + 1);
    trackEvent("atelier_draw", { source, surface: compact ? "embedded" : "atelier" });
    if (!compact) {
      router.replace(`${pathname}?seed=${nextSeed}` as Route, { scroll: false });
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!input.trim()) {
      startDraw(randomSeedHex(), "random");
      return;
    }
    startDraw(seedFromInput(input), "input");
  }

  const editions: AssetTheme[] = twin ? ["black", "white"] : [edition];

  function download() {
    // Canvases render in `editions` order; the first is the wing's edition.
    const canvas = stageRef.current?.querySelector("canvas");
    const theme = editions[0] ?? edition;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `randomwalk-${seed.slice(2, 10)}-${theme}-unminted.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    trackEvent("atelier_draw", { source: "download", surface: compact ? "embedded" : "atelier" });
  }

  return (
    <div className="space-y-5" data-testid="atelier-studio">
      {!compact ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="atelier-seed">
            Seed or text to turn into a seed
          </label>
          <Input
            id="atelier-seed"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Paste a 32-byte seed, or type anything — a name, a date, a sentence"
            className="font-mono"
            autoComplete="off"
            spellCheck={false}
          />
          <div className="flex gap-2">
            <Button type="submit" data-testid="atelier-draw">
              Draw
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => startDraw(randomSeedHex(), "random")}
              data-testid="atelier-random"
            >
              <Shuffle className="h-3.5 w-3.5" aria-hidden />
              Random
            </Button>
          </div>
        </form>
      ) : null}

      <div ref={stageRef} className={twin ? "grid gap-4 md:grid-cols-2" : ""}>
        {editions.map((theme) => (
          <div key={theme} className="overflow-hidden rounded-md border border-border">
            <WalkCanvas
              key={`${drawKey}-${theme}`}
              seed={seed}
              vert={300}
              durationMs={DRAW_DURATION_MS}
              background={theme}
              onComplete={theme === editions[0] ? () => setDrawing(false) : undefined}
              label={`Random walk drawn from seed ${seed.slice(0, 10)}, ${theme} edition`}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow">{drawing ? "Drawing from seed" : "Walk complete · every pixel placed by chance"}</p>
          <p className="mt-1 truncate font-mono text-xs text-muted-foreground" title={seed}>
            {seed}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => startDraw(randomSeedHex(), "redraw")}
            data-testid="atelier-redraw"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            Draw another
          </Button>
          <Button variant="outline" size="sm" onClick={() => setTwin((value) => !value)} aria-pressed={twin}>
            <Columns2 className="h-3.5 w-3.5" aria-hidden />
            {twin ? "One edition" : "Both editions"}
          </Button>
          <Button variant="outline" size="sm" onClick={download} disabled={drawing}>
            <Download className="h-3.5 w-3.5" aria-hidden />
            Download PNG
          </Button>
          {!compact ? (
            <Button asChild variant="accent" size="sm">
              <Link href="/mint">Mint a real one</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
