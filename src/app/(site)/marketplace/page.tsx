import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { JsonLd } from "@/components/common/json-ld";
import { PageHeading } from "@/components/common/page-heading";
import { PageShell } from "@/components/common/page-shell";
import { MarketplaceToolbar } from "@/components/marketplace/marketplace-toolbar";
import { NftCard } from "@/components/nft/nft-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getOffers } from "@/lib/api/public";
import { SITE_NAME, SITE_URL } from "@/lib/config";
import { parseMarketplaceQueryState } from "@/lib/query-state";
import { createAssetUrls, formatEth, formatId } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Marketplace",
  description:
    "Buy and sell Random Walk NFTs on a zero-fee marketplace. Browse sell listings and buy offers for generative art on Arbitrum.",
  alternates: { canonical: "/marketplace" },
  openGraph: {
    title: "Marketplace | Random Walk NFT",
    description:
      "Buy and sell Random Walk NFTs on a zero-fee marketplace. Browse sell listings and buy offers for generative art on Arbitrum."
  }
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

  const lowestPrice = offers.length ? Math.min(...offers.map((o) => o.price)) : undefined;
  const highestPrice = offers.length ? Math.max(...offers.map((o) => o.price)) : undefined;

  return (
    <PageShell className="space-y-8 py-16">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `${SITE_NAME} Marketplace`,
          url: `${SITE_URL}/marketplace`,
          numberOfItems: offers.length,
          itemListElement: offers.slice(0, 12).map((offer, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: `${SITE_URL}/detail/${offer.tokenId}`,
            name: `${offer.kind === "buy" ? "Buy offer" : "Sell listing"} for NFT #${String(offer.tokenId).padStart(6, "0")}`
          }))
        }}
      />
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/gallery", label: "Collection" },
          { label: "Marketplace" }
        ]}
      />
      <PageHeading
        eyebrow="Zero-fee marketplace"
        title={[
          { text: "RANDOM" },
          { text: "WALK", tone: "primary" },
          { text: "NFTS" },
          { text: "MARKETPLACE", tone: "secondary" }
        ]}
        description="Buy and sell Random Walk NFTs with zero platform fees. Filter by price, token ID, or offer type."
      />

      <MarketplaceToolbar state={state} totalOffers={offers.length} />

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-primary/30 bg-primary/[0.06]">
          <CardContent className="space-y-2 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-primary">Platform fee</p>
            <p className="text-2xl font-bold text-primary">0%</p>
            <p className="text-xs leading-5 text-muted-foreground">No cuts — the full amount goes directly between buyer and seller.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Total listings</p>
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
          No results match your current filters. Try adjusting the price range or switching between buy offers and sell listings.
        </div>
      ) : null}
    </PageShell>
  );
}
