"use client";

import { useAccount } from "wagmi";

import { PageHeading } from "@/components/common/page-heading";
import { PageShell } from "@/components/common/page-shell";
import { NftGrid } from "@/components/nft/nft-grid";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useReadNftWalletOfOwner } from "@/generated/wagmi";
import { useMounted } from "@/lib/use-mounted";

export function MyNftsView() {
  const mounted = useMounted();
  const { address, isConnected } = useAccount();
  const { data } = useReadNftWalletOfOwner({
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address)
    }
  });

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
      ) : !isConnected ? (
        <Card>
          <CardContent className="p-6 text-muted-foreground">Connect your wallet to view your NFTs.</CardContent>
        </Card>
      ) : (
        <NftGrid ids={ids} emptyMessage="No NFTs found." emptyDescription="You don't own any Random Walk NFTs yet. Mint one or buy from the marketplace." />
      )}
    </PageShell>
  );
}
