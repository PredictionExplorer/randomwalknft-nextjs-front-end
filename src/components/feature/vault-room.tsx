"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import type { VaultState } from "@/lib/types";
import { shortenAddress } from "@/lib/utils";

function splitDuration(totalSeconds: number) {
  const clamped = Math.max(0, totalSeconds);
  return {
    days: Math.floor(clamped / 86_400),
    hours: Math.floor((clamped % 86_400) / 3_600),
    minutes: Math.floor((clamped % 3_600) / 60),
    seconds: clamped % 60
  };
}

/** Homepage Vault room: the live prize, the ticking clock, and the keyholder. */
export function VaultRoom({ initialVault }: { initialVault: VaultState }) {
  const [nowMs, setNowMs] = useState(() => initialVault.readAtMs);

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const elapsedSeconds = Math.floor((nowMs - initialVault.readAtMs) / 1000);
  const remaining = Math.max(0, initialVault.secondsUntilWithdrawal - elapsedSeconds);
  const claimable = remaining <= 0;
  const parts = splitDuration(remaining);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Inside the vault</p>
          <p className="mt-2 text-6xl font-semibold tabular-nums text-secondary sm:text-7xl" data-testid="vault-room-prize">
            {initialVault.prizeEth.toFixed(2)}
            <span className="ml-3 text-2xl font-normal text-muted-foreground">ETH</span>
          </p>
        </div>
        {initialVault.lastMinter ? (
          <p className="text-sm leading-7 text-muted-foreground">
            The key is held by{" "}
            <Link
              href={`/gallery?address=${initialVault.lastMinter}` as Route}
              className="font-mono text-secondary transition hover:text-primary"
            >
              {shortenAddress(initialVault.lastMinter)}
            </Link>
            {claimable
              ? " — the clock has reached zero and the vault stands open for them."
              : " — if nobody mints before the clock below runs out, everything above is theirs."}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg" variant="secondary">
            <Link href="/vault">Visit the vault</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/mint">
              Take the key
              {initialVault.mintPriceEth != null
                ? ` — mint for ${initialVault.mintPriceEth.toFixed(4)} ETH`
                : ""}
            </Link>
          </Button>
        </div>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          {claimable ? "The vault is open" : "The vault opens in"}
        </p>
        <p className="sr-only">
          {claimable
            ? "The withdrawal window is open now."
            : `About ${parts.days} days and ${parts.hours} hours remain until the withdrawal window opens.`}
        </p>
        {/* The per-second digits are decorative for screen readers; the summary above is stable. */}
        <div className="mt-3 grid grid-cols-4 gap-3" aria-hidden>
          {Object.entries(parts).map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-secondary/25 bg-secondary/5 p-4 text-center">
              <p className="text-3xl font-semibold tabular-nums sm:text-4xl">{String(value).padStart(2, "0")}</p>
              <p className="mt-1 text-[0.65rem] uppercase tracking-[0.28em] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Every mint resets this clock to 30 days and hands the key to the newest minter.
        </p>
      </div>
    </div>
  );
}
