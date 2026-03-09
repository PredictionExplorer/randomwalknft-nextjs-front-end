import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { PageHeading } from "@/components/common/page-heading";
import { PageShell } from "@/components/common/page-shell";
import { MarketplaceToolbar } from "@/components/marketplace/marketplace-toolbar";
import { NftCard } from "@/components/nft/nft-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getOffers } from "@/lib/api/public";
import { parseMarketplaceQueryState } from "@/lib/query-state";
import { createAssetUrls, formatEth, formatId } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Marketplace"
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function MarketplacePage({ searchParams }: { searchParams: SearchParams }) {
  const resolvedSearchParams = await searchParams;
  const state = parseMarketplaceQueryState(resolvedSearchParams);
  const { filter, sort, min, max, query } = state;
  let offers = await getOffers(filter);

  if (query !== undefined) {
    offers = offers.filter((offer) => offer.tokenId === query);
  }
  if (min !== undefined) {
    offers = offers.filter((offer) => offer.price >= min);
  }
  if (max !== undefined) {
    offers = offers.filter((offer) => offer.price <= max);
  }

  offers =
    sort === "price-desc"
      ? [...offers].sort((left, right) => right.price - left.price)
      : sort === "recent"
        ? [...offers].sort((left, right) => right.createdAtTimestamp - left.createdAtTimestamp)
        : [...offers].sort((left, right) => left.price - right.price);

  const lowestPrice = offers[0]?.price;
  const highestPrice = offers.length ? offers[offers.length - 1]?.price : undefined;

  return (
    <PageShell className="space-y-8 py-16">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/gallery", label: "Collection" },
          { label: "Marketplace" }
        ]}
      />
      <PageHeading
        eyebrow="Native collector market"
        title={[
          { text: "RANDOM" },
          { text: "WALK", tone: "primary" },
          { text: "NFTS" },
          { text: "MARKETPLACE", tone: "secondary" }
        ]}
        description="Zero-fee listings and bids, sorted for serious collectors who want faster price discovery."
      />

      <MarketplaceToolbar state={state} totalOffers={offers.length} />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="space-y-2 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Visible entries</p>
            <p className="text-2xl font-semibold">{offers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Lowest price</p>
            <p className="text-2xl font-semibold">{lowestPrice !== undefined ? formatEth(lowestPrice) : "N/A"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Highest price</p>
            <p className="text-2xl font-semibold">{highestPrice !== undefined ? formatEth(highestPrice) : "N/A"}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {offers.map((offer) => (
          <div key={`${offer.kind}-${offer.offerId}`} className="space-y-3">
            <NftCard id={offer.tokenId} image={createAssetUrls(offer.tokenId).blackThumb} href={`/detail/${offer.tokenId}`} />
            <div className="flex items-center justify-between">
              <Badge variant={offer.kind === "buy" ? "secondary" : "default"}>{offer.kind === "buy" ? "Buy offer" : "Sell listing"}</Badge>
              <span className="text-sm text-muted-foreground">
                {formatId(offer.tokenId)} · {formatEth(offer.price)}
              </span>
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
