"use client";

import { useReadContract } from "wagmi";

import { PageHeading } from "@/components/common/page-heading";
import { PageShell } from "@/components/common/page-shell";
import { NftGrid } from "@/components/nft/nft-grid";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useContracts } from "@/components/providers/contracts-context";
import { WalletStatusCard } from "@/components/wallet/wallet-status-card";
import { nftAbi } from "@/generated/wagmi";
import { useMounted } from "@/lib/use-mounted";
import { getChainDisplayName } from "@/lib/web3/evm-chain";
import { useWalletStatus } from "@/lib/web3/use-wallet-status";

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

  const ids = (data ?? []).map((value) => Number(value)).reverse();

  return (
    <PageShell className="space-y-8 py-16">
      <PageHeading
        title={[
          { text: "MY", tone: "secondary" },
          { text: "RANDOM" },
          { text: "WALK", tone: "primary" },
          { text: "NFTS" }
        ]}
      />

      {!mounted ? (
        <Skeleton className="h-48 w-full" />
      ) : !isReady ? (
        <WalletStatusCard
          disconnectedTitle="Wallet required"
          disconnectedBody="Connect your wallet to view your NFTs."
          wrongNetworkBody={`Switch to ${getChainDisplayName()} to load your NFTs.`}
        />
      ) : awaitingWalletOfOwner ? (
        <Skeleton className="min-h-[24rem] w-full" />
      ) : readFailed ? (
        <Card>
          <CardContent className="space-y-2 p-6 text-muted-foreground">
            <p className="font-medium text-foreground">Could not load your NFTs from the chain.</p>
            <p className="text-sm">
              {readError instanceof Error ? readError.message : "Check your RPC (NEXT_PUBLIC_RPC_URL) and network."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <NftGrid
          ids={ids}
          disableAnimation
          emptyMessage="No NFTs found."
          emptyDescription="You don't own any Random Walk NFTs yet. Mint one here or collect one on Axiom Zero."
        />
      )}
    </PageShell>
  );
}
