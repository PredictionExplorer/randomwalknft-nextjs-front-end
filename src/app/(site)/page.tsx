import Link from "next/link";
import type { Metadata } from "next";
import type { Route } from "next";

import { ExternalLink } from "@/components/common/external-link";
import { HeroVideo } from "@/components/feature/hero-video";
import { JsonLd } from "@/components/common/json-ld";
import { NftCard } from "@/components/nft/nft-card";
import { PageHeading } from "@/components/common/page-heading";
import { PageShell } from "@/components/common/page-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getHomepageStats } from "@/lib/api/public";
import { homepageHowItWorks, homepageTrustCards } from "@/lib/content/homepage";
import { MARKET_ADDRESS, NFT_ADDRESS, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/config";
import { arbiscanContractUrl, createAssetUrls, formatCompactNumber, formatEth, formatId } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Home",
  description: SITE_DESCRIPTION
};

export default async function HomePage() {
  const stats = await getHomepageStats();
  const [featuredId] = stats.featuredTokenIds;
  const featuredCards = stats.featuredTokenIds.slice(0, 3);

  return (
    <div className="relative overflow-hidden">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE_NAME,
          url: SITE_URL,
          description: SITE_DESCRIPTION
        }}
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(244,191,255,0.18),transparent_32%),radial-gradient(circle_at_85%_15%,rgba(198,118,215,0.18),transparent_24%),linear-gradient(180deg,rgba(5,5,5,0.4),rgba(5,5,5,0.96))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[min(84vh,56rem)] overflow-hidden opacity-70">
        <HeroVideo initialTokenId={featuredId ?? 1} />
      </div>

      <PageShell className="space-y-20 pt-2 pb-20 sm:pt-3 sm:pb-24">
        <section className="grid min-h-[calc(100vh-6rem)] items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]">
          <div className="max-w-4xl space-y-8">
            <Badge variant="secondary">Generative art on Arbitrum</Badge>
            <PageHeading
              eyebrow="CC0 public-domain collection"
              title={[
                { text: "RANDOM", tone: "primary" },
                { text: "WALK" },
                { text: "NFT", tone: "secondary" }
              ]}
              description="Every mint creates a unique seed. Every seed becomes a still image and motion artwork. And the ETH you spend flows back to collectors — not creators."
            />

            <div className="max-w-2xl space-y-4 text-base leading-8 text-muted-foreground">
              <p>
                Random Walk NFT is a generative collection where each token produces unique still images and video variants from a single on-chain seed — all released under CC0 public domain.
              </p>
              <p>
                Mint on Arbitrum for under $0.10 in gas, browse works ranked by community beauty scores, and trade on a zero-fee marketplace with no platform cuts.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/mint"
                className="inline-flex h-12 items-center justify-center rounded-full border border-primary bg-primary px-7 text-sm font-bold tracking-wide text-white shadow-[0_0_24px_rgba(198,118,215,0.5)] transition hover:bg-primary/85 hover:shadow-[0_0_32px_rgba(198,118,215,0.65)]"
              >
                Mint the next work
              </Link>
              <Button asChild variant="outline" size="lg">
                <Link href="/gallery">Browse collection</Link>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <Link href="/marketplace">Explore marketplace</Link>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Minted", value: formatCompactNumber(stats.mintedCount) },
                { label: "Active listings", value: formatCompactNumber(stats.activeListings) },
                { label: "Buy offers", value: formatCompactNumber(stats.activeBids) },
                { label: "Latest sale", value: stats.latestSalePrice ? formatEth(stats.latestSalePrice) : "Pending" }
              ].map((item) => (
                <Card key={item.label} className="bg-background/60">
                  <CardContent className="space-y-2 p-5">
                    <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">{item.label}</p>
                    <p className="text-2xl font-semibold text-foreground">{item.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="overflow-hidden bg-background/55">
            <CardContent className="space-y-6 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-muted-foreground">Featured now</p>
                  <Link href={`/detail/${featuredId ?? 1}` as Route} className="mt-2 inline-block text-2xl font-semibold text-secondary transition hover:text-primary">
                    {formatId(featuredId ?? 1)}
                  </Link>
                </div>
                <Badge>Live media</Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {featuredCards.map((id) => (
                  <NftCard
                    key={id}
                    id={id}
                    image={createAssetUrls(id).blackThumb}
                    href={`/detail/${id}`}
                    compact
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="how-it-works" className="space-y-8 scroll-mt-32">
          <PageHeading
            eyebrow="How it works"
            title={[
              { text: "COLLECT" },
              { text: "THE", tone: "primary" },
              { text: "RANDOM WALK", tone: "secondary" }
            ]}
            description="Three steps — from minting a seed to earning from the collection."
          />
          <div className="grid gap-6 lg:grid-cols-3">
            {homepageHowItWorks.map((item) => (
              <Card key={item.step} className="bg-card/70">
                <CardContent className="space-y-4 p-6">
                  <p className="text-xs uppercase tracking-[0.28em] text-secondary">{item.step}</p>
                  <h2 className="text-2xl font-semibold">{item.title}</h2>
                  <p className="text-sm leading-7 text-muted-foreground">{item.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-8">
            <PageHeading
              eyebrow="Recent activity"
              title={[
                { text: "RECENT" },
                { text: "MARKETPLACE", tone: "primary" },
                { text: "ACTIVITY", tone: "secondary" }
              ]}
              description="The latest sales across the collection — see what collectors are buying and at what price."
            />
            <div className="grid gap-4 md:grid-cols-2">
              {stats.recentSales.map((sale) => (
                <Card key={sale.id} className="bg-card/70">
                  <CardContent className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Recent sale</p>
                        <Link href={`/detail/${sale.tokenId}` as Route} className="mt-2 inline-block text-xl font-semibold text-secondary">
                          {formatId(sale.tokenId)}
                        </Link>
                      </div>
                      <Badge variant="default">{formatEth(sale.price)}</Badge>
                    </div>
                    <p className="text-sm leading-7 text-muted-foreground">
                      Seller {sale.seller.slice(0, 8)}… → Buyer {sale.buyer.slice(0, 8)}…
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="bg-card/70">
            <CardContent className="space-y-4 p-6">
              <p className="text-xs uppercase tracking-[0.26em] text-muted-foreground">Collector trust</p>
              <div className="space-y-3 text-sm leading-7 text-muted-foreground">
                <p>
                  NFT contract:
                  {" "}
                  <ExternalLink href={arbiscanContractUrl(NFT_ADDRESS)} className="text-secondary">
                    {NFT_ADDRESS}
                  </ExternalLink>
                </p>
                <p>
                  Marketplace contract:
                  {" "}
                  <ExternalLink href={arbiscanContractUrl(MARKET_ADDRESS)} className="text-secondary">
                    {MARKET_ADDRESS}
                  </ExternalLink>
                </p>
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href="/faq">Read the collector FAQ</Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-8">
          <PageHeading
            eyebrow="Why collectors trust it"
            title={[
              { text: "BUILT" },
              { text: "ON", tone: "primary" },
              { text: "TRUST", tone: "secondary" }
            ]}
            description="Verified contracts, transparent economics, and public-domain art — designed so you can collect with confidence."
          />
          <div className="grid gap-6 lg:grid-cols-3">
            {homepageTrustCards.map((item) => (
              <Card key={item.title} className="bg-card/70">
                <CardContent className="space-y-4 p-6">
                  <p className="text-xs uppercase tracking-[0.24em] text-secondary">{item.eyebrow}</p>
                  <h2 className="text-2xl font-semibold">{item.title}</h2>
                  <p className="text-sm leading-7 text-muted-foreground">{item.body}</p>
                  {item.href && item.linkLabel ? (
                    <Button asChild variant="ghost" size="sm">
                      <ExternalLink href={item.href}>{item.linkLabel}</ExternalLink>
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </PageShell>
    </div>
  );
}
