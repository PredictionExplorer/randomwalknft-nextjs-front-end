import type { Metadata } from "next";

import { PageHeading } from "@/components/common/page-heading";
import { PageShell } from "@/components/common/page-shell";
import { NftCard } from "@/components/nft/nft-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getOffers } from "@/lib/api/public";
import { createAssetUrls, formatEth } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Marketplace"
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function MarketplacePage({ searchParams }: { searchParams: SearchParams }) {
  const resolvedSearchParams = await searchParams;
  const filter = resolvedSearchParams.filter === "buy" ? "buy" : "sell";
  const offers = await getOffers(filter);

  return (
    <PageShell className="space-y-8 py-16">
      <PageHeading
        title={[
          { text: "RANDOM" },
          { text: "WALK", tone: "primary" },
          { text: "NFTS" },
          { text: "MARKETPLACE", tone: "secondary" }
        ]}
        description="Browse active marketplace listings and standing buy offers."
      />

      <div className="flex flex-wrap gap-3">
        <Button asChild variant={filter === "sell" ? "default" : "outline"} size="sm">
          <a href="/marketplace" style={filter === "sell" ? { color: "#140a1f" } : undefined}>
            Sell listings
          </a>
        </Button>
        <Button asChild variant={filter === "buy" ? "default" : "outline"} size="sm">
          <a href="/marketplace?filter=buy" style={filter === "buy" ? { color: "#140a1f" } : undefined}>
            Buy offers
          </a>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {offers.map((offer) => (
          <div key={`${offer.kind}-${offer.offerId}`} className="space-y-3">
            <NftCard id={offer.tokenId} image={createAssetUrls(offer.tokenId).blackThumb} href={`/detail/${offer.tokenId}`} />
            <div className="flex items-center justify-between">
              <Badge variant={offer.kind === "buy" ? "secondary" : "default"}>{offer.kind === "buy" ? "Buy offer" : "Sell listing"}</Badge>
              <span className="text-sm text-muted-foreground">{formatEth(offer.price)}</span>
            </div>
          </div>
        ))}
      </div>

      {!offers.length ? (
        <div className="rounded-[1.5rem] border border-dashed border-border px-6 py-12 text-center text-muted-foreground">
          No marketplace entries are available for this filter right now.
        </div>
      ) : null}
    </PageShell>
  );
}
