"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Lock } from "lucide-react";

import { formatClock } from "@/lib/time";
import type { VaultState } from "@/lib/types";
import { cn } from "@/lib/utils";

async function fetchVaultState(): Promise<VaultState> {
  const response = await fetch("/api/vault");
  if (!response.ok) {
    throw new Error("vault_unavailable");
  }
  return (await response.json()) as VaultState;
}

/**
 * Ambient header chip with the live Vault prize and claim countdown.
 * Values come from /api/vault (CDN-cached); the clock ticks locally between refreshes.
 */
export function VaultTicker({ className }: { className?: string }) {
  const { data: vault } = useQuery({
    queryKey: ["vault-state"],
    queryFn: fetchVaultState,
    refetchInterval: 60_000,
    staleTime: 30_000,
    retry: 1
  });
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!vault) {
    return null;
  }

  const elapsedSeconds = Math.floor((nowMs - vault.readAtMs) / 1000);
  const remaining = vault.secondsUntilWithdrawal - elapsedSeconds;
  const claimable = remaining <= 0;

  return (
    <Link
      href="/vault"
      aria-label={`Vault: ${vault.prizeEth.toFixed(2)} ETH prize, ${
        claimable ? "claimable now" : `claimable in ${formatClock(remaining)}`
      }`}
      data-testid="vault-ticker"
      className={cn(
        "group inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-secondary hover:bg-secondary/20",
        className
      )}
    >
      <Lock className="h-3.5 w-3.5 text-secondary" aria-hidden />
      <span className="whitespace-nowrap tabular-nums">{vault.prizeEth.toFixed(2)} ETH</span>
      <span
        aria-hidden
        className={cn(
          "hidden whitespace-nowrap tabular-nums text-muted-foreground group-hover:text-foreground sm:inline",
          claimable && "text-secondary"
        )}
      >
        {claimable ? "claimable now" : formatClock(remaining)}
      </span>
    </Link>
  );
}
