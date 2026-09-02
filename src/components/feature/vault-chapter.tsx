"use client";

import type { Route } from "next";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform } from "motion/react";
import * as m from "motion/react-m";
import { useEffect, useRef, useState } from "react";
import { animate } from "motion";

import { NftCard } from "@/components/nft/nft-card";
import { Button } from "@/components/ui/button";
import { describeDuration, formatRelativeTime, splitDuration } from "@/lib/time";
import type { RecentMint, VaultState } from "@/lib/types";
import { cn, shortenAddress } from "@/lib/utils";

type VaultChapterProps = {
  vault: VaultState;
  recentMints: RecentMint[];
  /** The keyholder's newest work. */
  keyholderTokenId?: number | undefined;
};

/**
 * Chapter V of the homepage: the Vault. The prize counts up from zero as the
 * section enters view, the clock ticks live, and the newest acquisitions scroll by.
 */
export function VaultChapter({ vault, recentMints, keyholderTokenId }: VaultChapterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const reducedMotion = useReducedMotion() ?? false;
  const counter = useMotionValue(reducedMotion ? vault.prizeEth : 0);
  const [displayedPrize, setDisplayedPrize] = useState(reducedMotion ? vault.prizeEth : 0);
  const [nowMs, setNowMs] = useState(() => vault.readAtMs);

  useMotionValueEvent(counter, "change", (value) => setDisplayedPrize(value));

  useEffect(() => {
    if (!inView || reducedMotion) {
      return;
    }
    const controls = animate(counter, vault.prizeEth, { duration: 2.4, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [inView, reducedMotion, vault.prizeEth, counter]);

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const elapsedSeconds = Math.max(0, Math.floor((nowMs - vault.readAtMs) / 1000));
  const remaining = Math.max(0, vault.secondsUntilWithdrawal - elapsedSeconds);
  const claimable = remaining <= 0;
  const parts = splitDuration(remaining);
  const prizeRatio =
    vault.mintPriceEth && vault.mintPriceEth > 0 ? Math.round(vault.prizeEth / vault.mintPriceEth) : null;
  const prizeOpacity = useTransform(counter, [0, vault.prizeEth || 1], [0.6, 1]);

  return (
    <div
      ref={ref}
      className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14"
      data-testid="vault-chapter"
    >
      <div className="space-y-10">
        <div>
          <p className="eyebrow text-accent">Inside the vault</p>
          <p className="mt-3 flex flex-wrap items-baseline gap-x-4">
            <m.span
              className="font-display text-7xl leading-none tabular-nums text-foreground sm:text-8xl lg:text-9xl"
              style={{ opacity: prizeOpacity }}
              data-testid="vault-chapter-prize"
            >
              {displayedPrize.toFixed(2)}
            </m.span>
            <span className="font-mono text-lg uppercase tracking-[0.2em] text-muted-foreground">ETH</span>
          </p>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
            Every mint since 2021 paid into the contract; the creators took nothing. This is the half that goes to
            whoever holds the key when the clock reaches zero.
            {prizeRatio ? ` Today that is about ${prizeRatio}× the price of one mint.` : ""}
          </p>
        </div>

        <div>
          <p className="eyebrow">{claimable ? "The vault is open" : "The vault opens in"}</p>
          <p className="sr-only">
            {claimable
              ? "The withdrawal window is open now."
              : `${describeDuration(remaining)} remain until the withdrawal window opens.`}
          </p>
          <div className="mt-3 grid max-w-xl grid-cols-4 gap-2 sm:gap-3" aria-hidden>
            {Object.entries(parts).map(([label, value]) => (
              <div key={label} className="rounded-md border border-border bg-surface px-2 py-4 text-center sm:px-4">
                <p className="font-display text-3xl tabular-nums sm:text-5xl">{String(value).padStart(2, "0")}</p>
                <p className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
                  {label}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Every mint resets the clock to 30 days and hands the key to the newest minter.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="accent" size="lg">
            <Link href="/mint">
              <KeyRound className="h-4 w-4" aria-hidden />
              Take the key{vault.mintPriceEth != null ? ` · ${vault.mintPriceEth.toFixed(4)} ETH` : ""}
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/vault">Enter the vault</Link>
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-md border border-accent/40 bg-accent-soft p-5">
          <p className="eyebrow text-accent">The keyholder</p>
          {vault.lastMinter ? (
            <>
              <Link
                href={`/gallery?address=${vault.lastMinter}` as Route}
                className="mt-2 block break-all font-mono text-sm text-foreground transition-colors hover:text-accent"
              >
                {vault.lastMinter}
              </Link>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Holds the only key
                {vault.lastMintAtMs
                  ? ` since ${formatRelativeTime(vault.lastMintAtMs, nowMs).replace(" ago", "")} ago`
                  : ""}
                .
                {claimable
                  ? " The clock has reached zero; the vault stands open for them."
                  : " If nobody mints before the clock runs out, this prize is theirs."}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">No minter recorded yet.</p>
          )}
          {keyholderTokenId != null ? (
            <div className="mt-4">
              <NftCard id={keyholderTokenId} href={`/detail/${keyholderTokenId}`} sublabel="Their newest work" />
            </div>
          ) : null}
        </div>

        {recentMints.length > 0 ? (
          <div>
            <p className="eyebrow">Recent acquisitions</p>
            <ol className="mt-3 divide-y divide-border border-y border-border" data-testid="recent-mints">
              {recentMints.map((mint, index) => (
                <li key={mint.id}>
                  <Link
                    href={`/detail/${mint.id}` as Route}
                    className={cn(
                      "flex items-center justify-between gap-4 py-3 font-mono text-xs transition-colors hover:text-accent",
                      index === 0 ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    <span className="tabular-nums">#{String(mint.id).padStart(6, "0")}</span>
                    <span className="truncate">{shortenAddress(mint.minter)}</span>
                    <span className="shrink-0 text-right">
                      {mint.mintedAtMs ? formatRelativeTime(mint.mintedAtMs, nowMs) : index === 0 ? "newest" : ""}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </div>
    </div>
  );
}
