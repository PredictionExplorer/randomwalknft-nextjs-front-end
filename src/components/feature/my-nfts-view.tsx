"use client";

import { useAccount } from "wagmi";

import { PageHeading } from "@/components/common/page-heading";
import { PageShell } from "@/components/common/page-shell";
import { NftGrid } from "@/components/nft/nft-grid";
import { Card, CardContent } from "@/components/ui/card";
import { useReadNftWalletOfOwner } from "@/generated/wagmi";

export function MyNftsView() {
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

      {!isConnected ? (
        <Card>
          <CardContent className="p-6 text-muted-foreground">Connect your wallet to load your NFTs.</CardContent>
        </Card>
      ) : (
        <NftGrid ids={ids} emptyMessage="No NFTs found for this wallet." />
      )}
    </PageShell>
  );
}
