"use client";

import type { Route } from "next";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { usePublicClient, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

import { NftCard } from "@/components/nft/nft-card";
import { useContracts } from "@/components/providers/contracts-context";
import { Button } from "@/components/ui/button";
import { WalletStatusCard } from "@/components/wallet/wallet-status-card";
import { nftAbi } from "@/generated/wagmi";
import { trackEvent } from "@/lib/analytics";
import { describeDuration, formatRelativeTime, splitDuration } from "@/lib/time";
import type { VaultState } from "@/lib/types";
import { cn, formatEth, shortenAddress } from "@/lib/utils";
import { getErrorMessage } from "@/lib/web3/errors";
import { getChainDisplayName } from "@/lib/web3/evm-chain";
import { prepareContractWrite } from "@/lib/web3/transaction-preflight";
import { useWalletStatus } from "@/lib/web3/use-wallet-status";
import { showWalletError } from "@/lib/web3/wallet-toast";

const ROUND_SECONDS = 30 * 24 * 60 * 60;

async function fetchVaultState(): Promise<VaultState> {
  const response = await fetch("/api/vault");
  if (!response.ok) {
    throw new Error("vault_unavailable");
  }
  return (await response.json()) as VaultState;
}

/** A thin brass arc that empties as the 30 days run out. */
function ClockRing({ fraction, claimable }: { fraction: number; claimable: boolean }) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden>
      <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--border)" strokeWidth="1" />
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - fraction)}
        className={cn("transition-[stroke-dashoffset] duration-1000 ease-linear", claimable && "animate-pulse-soft")}
      />
    </svg>
  );
}

/** The clock room: the whole 30-day round as one instrument, plus the keyholder and the claim. */
export function VaultExperience({
  initialVault,
  keyholderTokenId
}: {
  initialVault: VaultState;
  keyholderTokenId?: number | undefined;
}) {
  const { NFT_ADDRESS } = useContracts();
  const publicClient = usePublicClient();
  const { address, canTransact, isReady } = useWalletStatus();
  const { data: vault } = useQuery({
    queryKey: ["vault-state"],
    queryFn: fetchVaultState,
    initialData: initialVault,
    refetchInterval: 60_000,
    staleTime: 30_000
  });
  const [nowMs, setNowMs] = useState(() => initialVault.readAtMs);
  const withdraw = useWriteContract();
  const { data: hash, isPending } = withdraw;
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isSuccess) {
      toast.success("The vault has been opened. The prize is yours.");
      trackEvent("transaction_confirmed", { flow: "redeem" });
    }
  }, [isSuccess]);

  const elapsedSeconds = Math.floor((nowMs - vault.readAtMs) / 1000);
  const remaining = Math.max(0, vault.secondsUntilWithdrawal - elapsedSeconds);
  const claimable = remaining <= 0;
  const parts = splitDuration(remaining);
  const roundFraction = Math.min(1, remaining / ROUND_SECONDS);
  const isKeyholder = address != null && address.toLowerCase() === vault.lastMinter?.toLowerCase();
  const ratio = vault.mintPriceEth && vault.mintPriceEth > 0 ? Math.round(vault.prizeEth / vault.mintPriceEth) : null;

  const handleWithdraw = async () => {
    try {
      if (!publicClient || !address || !canTransact) {
        throw new Error(`Connect your wallet on ${getChainDisplayName()} to continue.`);
      }

      const prepared = await prepareContractWrite({
        publicClient,
        account: address,
        address: NFT_ADDRESS,
        abi: nftAbi,
        functionName: "withdraw"
      });

      trackEvent("transaction_submitted", { flow: "redeem" });
      await withdraw.mutateAsync({
        address: NFT_ADDRESS,
        abi: nftAbi,
        functionName: "withdraw",
        ...prepared
      });
    } catch (error) {
      trackEvent("transaction_failed", { flow: "redeem", message: getErrorMessage(error) });
      showWalletError(error);
    }
  };

  return (
    <div className="space-y-12" data-testid="vault-room">
      {/* The instrument */}
      <div className="grid gap-10 border-y border-border py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
        <div className="relative mx-auto aspect-square w-full max-w-[26rem]">
          <ClockRing fraction={roundFraction} claimable={claimable} />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="eyebrow text-accent">{claimable ? "The vault is open" : "Opens in"}</p>
            <p className="sr-only">
              {claimable
                ? "The withdrawal window is open now."
                : `${describeDuration(remaining)} remain until the withdrawal window opens.`}
            </p>
            <p className="font-display mt-2 text-6xl leading-none tabular-nums sm:text-7xl" aria-hidden>
              {String(parts.days).padStart(2, "0")}
              <span className="text-2xl text-muted-foreground sm:text-3xl">d</span>
            </p>
            <p className="mt-2 font-mono text-lg tabular-nums text-muted-foreground sm:text-xl" aria-hidden>
              {[parts.hours, parts.minutes, parts.seconds].map((value) => String(value).padStart(2, "0")).join(":")}
            </p>
            <p className="mt-4 max-w-[14rem] font-mono text-[0.6rem] uppercase leading-5 tracking-[0.18em] text-muted-foreground">
              Every mint resets the clock to 30 days
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <p className="eyebrow">Inside the vault</p>
            <p className="font-display mt-2 text-7xl leading-none tabular-nums sm:text-8xl" data-testid="vault-prize">
              {vault.prizeEth.toFixed(2)}
              <span className="ml-3 font-mono text-lg uppercase tracking-[0.2em] text-muted-foreground">ETH</span>
            </p>
            <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">
              Half of it — {formatEth(vault.prizeEth / 2, 2)} — goes to the keyholder when the clock reaches zero. The
              other half seeds the next round.{ratio ? ` The prize is about ${ratio}× the price of one mint.` : ""}
            </p>
          </div>

          <div className="space-y-3 rounded-md border border-accent/40 bg-accent-soft p-5">
            <p className="eyebrow text-accent">The keyholder</p>
            {vault.lastMinter ? (
              <Link
                href={`/gallery?address=${vault.lastMinter}` as Route}
                className="block break-all font-mono text-sm text-foreground transition-colors hover:text-accent"
              >
                {vault.lastMinter}
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground">No minter recorded yet.</p>
            )}
            <p className="text-sm leading-6 text-muted-foreground">
              {isKeyholder ? "That is you. " : ""}
              Holds the only key
              {vault.lastMintAtMs
                ? ` since ${formatRelativeTime(vault.lastMintAtMs, nowMs).replace(" ago", "")} ago`
                : ""}
              .
              {claimable
                ? " The clock has reached zero; the vault stands open for them alone."
                : " If nobody mints before the clock runs out, half the vault is theirs."}
            </p>
          </div>

          {!claimable ? (
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg" variant="accent">
                <Link href="/mint">
                  <KeyRound className="h-4 w-4" aria-hidden />
                  Take the key{vault.mintPriceEth != null ? ` · ${vault.mintPriceEth.toFixed(4)} ETH` : ""}
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground">Minting hands you the key and restarts the clock.</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* The claim */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <p className="eyebrow">Opening the vault</p>
          <p className="max-w-xl text-sm leading-7 text-muted-foreground">
            {claimable
              ? isKeyholder
                ? "The clock has reached zero and you hold the key. Withdraw to claim your prize — half the vault stays behind for the next round."
                : `The clock has reached zero. Only the keyholder${
                    vault.lastMinter ? ` (${shortenAddress(vault.lastMinter)})` : ""
                  } can open the vault. A new mint would start a new round instead.`
              : `Withdrawal unlocks when the clock reaches zero. Amount claimable then: ${formatEth(vault.prizeEth / 2, 2)}. The other half stays in the vault for the next round.`}
          </p>
          {!isReady && (claimable || isKeyholder) ? (
            <WalletStatusCard
              disconnectedTitle="Wallet required"
              disconnectedBody="Connect your wallet to check if you hold the key. Only the most recent minter can open the vault."
              wrongNetworkBody={`Switch to ${getChainDisplayName()} to check eligibility and withdraw.`}
            />
          ) : null}
          <Button
            onClick={handleWithdraw}
            disabled={isPending || isConfirming || !canTransact || !claimable}
            variant="accent"
            data-testid="vault-withdraw"
          >
            {isPending ? "Submitting…" : isConfirming ? "Confirming…" : "Open the vault"}
          </Button>
        </div>

        {keyholderTokenId != null ? (
          <div className="space-y-3">
            <p className="eyebrow">The keyholder&apos;s newest work</p>
            <NftCard id={keyholderTokenId} href={`/detail/${keyholderTokenId}`} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
