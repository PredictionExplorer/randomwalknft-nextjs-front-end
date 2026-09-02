"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePublicClient, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { toast } from "sonner";

import { NftCard } from "@/components/nft/nft-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WalletStatusCard } from "@/components/wallet/wallet-status-card";
import { trackEvent } from "@/lib/analytics";
import { useContracts } from "@/components/providers/contracts-context";
import { nftAbi } from "@/generated/wagmi";
import { splitDuration } from "@/lib/time";
import type { VaultState } from "@/lib/types";
import { formatEth, formatId, shortenAddress } from "@/lib/utils";
import { getErrorMessage } from "@/lib/web3/errors";
import { prepareContractWrite } from "@/lib/web3/transaction-preflight";
import { showWalletError } from "@/lib/web3/wallet-toast";
import { useWalletStatus } from "@/lib/web3/use-wallet-status";
import { getChainDisplayName } from "@/lib/web3/evm-chain";

async function fetchVaultState(): Promise<VaultState> {
  const response = await fetch("/api/vault");
  if (!response.ok) {
    throw new Error("vault_unavailable");
  }
  return (await response.json()) as VaultState;
}

/** Live vault room: big clock, prize, keyholder spotlight, dethrone CTA, withdraw flow. */
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
  const isKeyholder = address != null && address.toLowerCase() === vault.lastMinter?.toLowerCase();

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
    <div className="space-y-10">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <Card className="overflow-hidden border-secondary/30 bg-gradient-to-b from-secondary/10 to-background/60">
          <CardContent className="space-y-8 p-6 sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Inside the vault</p>
                <p
                  className="mt-2 text-5xl font-semibold tabular-nums text-secondary sm:text-6xl"
                  data-testid="vault-prize"
                >
                  {vault.prizeEth.toFixed(2)} ETH
                </p>
              </div>
              <p className="max-w-[16rem] text-sm leading-6 text-muted-foreground">
                Half of every mint ever paid. Claimable by the keyholder when the clock reaches zero.
              </p>
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
                  <div key={label} className="rounded-2xl border border-border/70 bg-background/60 p-4 text-center">
                    <p className="text-3xl font-semibold tabular-nums text-foreground sm:text-4xl">
                      {String(value).padStart(2, "0")}
                    </p>
                    <p className="mt-1 text-[0.65rem] uppercase tracking-[0.28em] text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Every new mint resets this clock to 30 days and hands the key to the new minter.
              </p>
            </div>

            {!claimable ? (
              <div className="flex flex-wrap items-center gap-4">
                <Button asChild size="lg">
                  <Link href="/mint">
                    Take the key — mint
                    {vault.mintPriceEth != null ? ` for ${vault.mintPriceEth.toFixed(4)} ETH` : ""}
                  </Link>
                </Button>
                {vault.mintPriceEth != null && vault.mintPriceEth > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    The prize is {(vault.prizeEth / vault.mintPriceEth).toFixed(0)}x the current mint price.
                  </p>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="bg-card/70">
          <CardContent className="space-y-5 p-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">The keyholder</p>
              {vault.lastMinter ? (
                <Link
                  href={`/gallery?address=${vault.lastMinter}` as Route}
                  className="mt-2 inline-block break-all font-mono text-sm text-secondary transition hover:text-primary"
                >
                  {vault.lastMinter}
                </Link>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">No minter recorded yet.</p>
              )}
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                The most recent minter holds the only key. If nobody mints before the clock runs out, the vault opens
                for them alone.
              </p>
            </div>
            {keyholderTokenId != null ? (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Their latest work</p>
                <NftCard
                  id={keyholderTokenId}
                  href={`/detail/${keyholderTokenId}`}
                  label={formatId(keyholderTokenId)}
                  compact
                />
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {!isReady && (claimable || isKeyholder) ? (
        <WalletStatusCard
          disconnectedTitle="Wallet required"
          disconnectedBody="Connect your wallet to check if you hold the key. Only the most recent minter can open the vault."
          wrongNetworkBody={`Switch to ${getChainDisplayName()} to check eligibility and withdraw.`}
        />
      ) : null}

      <Card>
        <CardContent className="space-y-5 p-6">
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
            {claimable
              ? isKeyholder
                ? "The clock has reached zero and you hold the key. Withdraw to claim your prize — half the vault stays behind for the next round."
                : `The clock has reached zero. Only the keyholder${
                    vault.lastMinter ? ` (${shortenAddress(vault.lastMinter)})` : ""
                  } can open the vault. A new mint would start a new round instead.`
              : `Withdrawal unlocks when the clock reaches zero. Amount claimable today: ${formatEth(
                  vault.prizeEth,
                  2
                )}. The other half stays in the vault for the next round.`}
          </p>
          <Button
            onClick={handleWithdraw}
            disabled={isPending || isConfirming || !canTransact || !claimable}
            data-testid="vault-withdraw"
          >
            {isPending ? "Submitting..." : isConfirming ? "Confirming..." : "Open the vault"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
