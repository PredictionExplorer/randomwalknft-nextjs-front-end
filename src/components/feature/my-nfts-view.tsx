"use client";

import type { Route } from "next";
import Link from "next/link";
import { useReadContract } from "wagmi";

import { ExternalLink } from "@/components/common/external-link";
import { PageHeading } from "@/components/common/page-heading";
import { PageShell } from "@/components/common/page-shell";
import { NftGrid } from "@/components/nft/nft-grid";
import { useContracts } from "@/components/providers/contracts-context";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WalletStatusCard } from "@/components/wallet/wallet-status-card";
import { nftAbi } from "@/generated/wagmi";
import { AXIOM_ZERO_MARKETPLACE_URL, COSMIC_SIGNATURE_URL } from "@/lib/config";
import { useMounted } from "@/lib/use-mounted";
import { shortenAddress } from "@/lib/utils";
import { getChainDisplayName } from "@/lib/web3/evm-chain";
import { useWalletStatus } from "@/lib/web3/use-wallet-status";

/** The collector's private room: everything the connected wallet holds, read live from the chain. */
export function MyNftsView() {
  const { NFT_ADDRESS } = useContracts();
  const mounted = useMounted();
  const { address, isReady } = useWalletStatus();
  const {
    data,
    error: readError,
    isError: readFailed
  } = useReadContract({
    address: NFT_ADDRESS,
    abi: nftAbi,
    functionName: "walletOfOwner",
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address && isReady)
    }
  });

  /**
   * After a successful read, `data` is a `bigint[]` (possibly empty). While the read is in flight,
   * `data` stays `undefined` — do not use `isSuccess` alone; it can disagree with `data` across wagmi/TanStack versions.
   */
  const awaitingWalletOfOwner = Boolean(address) && !readFailed && data === undefined;

  // Newest work first, matching the public wall for the same wallet.
  const ids = (data ?? []).map((value) => Number(value)).sort((left, right) => right - left);

  return (
    <PageShell className="space-y-10 py-12">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <PageHeading
          eyebrow="Your room"
          title="My Random Walks"
          description={
            isReady && address
              ? `Works held by ${shortenAddress(address, 6)}, read live from ${getChainDisplayName()}.`
              : "Every work your wallet holds, read live from the chain — rename them, send them, or put them to work."
          }
        />
        {isReady && data ? (
          <div className="flex flex-wrap gap-2">
            <p className="self-center font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {ids.length.toLocaleString()} work{ids.length === 1 ? "" : "s"}
            </p>
            {address ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/gallery?address=${address}` as Route}>Public wall</Link>
              </Button>
            ) : null}
            <Button asChild variant="accent" size="sm">
              <Link href="/mint">Mint another</Link>
            </Button>
          </div>
        ) : null}
      </div>

      {!mounted ? (
        <Skeleton className="h-48 w-full" />
      ) : !isReady ? (
        <WalletStatusCard
          disconnectedTitle="Wallet required"
          disconnectedBody="Connect your wallet to see the works it holds."
          wrongNetworkBody={`Switch to ${getChainDisplayName()} to load your works.`}
        />
      ) : awaitingWalletOfOwner ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3" aria-busy>
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="aspect-[1.6/1] w-full" />
          ))}
        </div>
      ) : readFailed ? (
        <div className="space-y-2 rounded-md border border-danger/40 p-6 text-muted-foreground" role="alert">
          <p className="font-medium text-foreground">Could not load your works from the chain.</p>
          <p className="text-sm">
            {readError instanceof Error ? readError.message : "Check your RPC (NEXT_PUBLIC_RPC_URL) and network."}
          </p>
        </div>
      ) : (
        <NftGrid
          ids={ids}
          disableAnimation
          emptyMessage="No works in this wallet yet."
          emptyDescription="Mint one — it hangs here within minutes — or collect one on Axiom Zero."
        />
      )}

      {isReady && ids.length > 0 ? (
        <section className="grid gap-6 border-t border-border pt-8 md:grid-cols-2" aria-label="Put your works to use">
          <div className="space-y-2">
            <p className="eyebrow">Beyond the museum</p>
            <p className="text-sm leading-7 text-muted-foreground">
              Anchor a work in Cosmic Signature to become eligible for Stellar Selection rewards, or spend one for a 50%
              discount on an ETH gesture there.
            </p>
            <Button asChild variant="outline" size="sm">
              <ExternalLink href={COSMIC_SIGNATURE_URL} showIcon>
                Open Cosmic Signature
              </ExternalLink>
            </Button>
          </div>
          <div className="space-y-2">
            <p className="eyebrow">Sell or lend</p>
            <p className="text-sm leading-7 text-muted-foreground">
              Secondary listings live on Axiom Zero. Open any work above to rename it or send it to another wallet.
            </p>
            <Button asChild variant="outline" size="sm">
              <ExternalLink href={AXIOM_ZERO_MARKETPLACE_URL} showIcon>
                Open Axiom Zero
              </ExternalLink>
            </Button>
          </div>
        </section>
      ) : null}
    </PageShell>
  );
}
