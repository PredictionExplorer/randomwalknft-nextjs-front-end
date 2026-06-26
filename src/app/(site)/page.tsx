import Link from "next/link";
import type { Metadata } from "next";
import type { Route } from "next";
import { unstable_noStore as noStore } from "next/cache";

import { ExternalLink } from "@/components/common/external-link";
import { HeroVideo } from "@/components/feature/hero-video";
import { JsonLd } from "@/components/common/json-ld";
import { NftCard } from "@/components/nft/nft-card";
import { PageHeading } from "@/components/common/page-heading";
import { PageShell } from "@/components/common/page-shell";
import { TermTooltip } from "@/components/common/term-tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getHomepageStats } from "@/lib/api/public";
import { homepageCosmicSignature, homepageHowItWorks, homepageTrustCards } from "@/lib/content/homepage";
import { AXIOM_ZERO_MARKETPLACE_URL, getBaseConfig } from "@/lib/config";
import { selectFeaturedTokensForDisplay } from "@/lib/featured-tokens";
import { getAppConfig } from "@/lib/server/app-config";
import { arbiscanContractUrl, createAssetUrls, formatCompactNumber, formatEth, formatId } from "@/lib/utils";

/** Keep collection stats fresh while the featured pool itself stays stable for each UTC day. */
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { SITE_DESCRIPTION, SITE_URL } = getBaseConfig();
  return {
    title: "Home",
    description: SITE_DESCRIPTION,
    alternates: { canonical: `${SITE_URL}/` }
  };
}

export default async function HomePage() {
  noStore();
  const { NFT_ADDRESS, SITE_DESCRIPTION, SITE_NAME, SITE_URL } = await getAppConfig();
  const stats = await getHomepageStats();
  const { featuredId, featuredCards } = selectFeaturedTokensForDisplay(stats.featuredTokenIds);

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
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
          description: SITE_DESCRIPTION,
          sameAs: [
            "https://twitter.com/RandomWalkNFT",
            "https://discord.gg/bGnPn96Qwt"
          ]
        }}
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(244,191,255,0.18),transparent_32%),radial-gradient(circle_at_85%_15%,rgba(198,118,215,0.18),transparent_24%),linear-gradient(180deg,rgba(5,5,5,0.4),rgba(5,5,5,0.96))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[min(84vh,56rem)] overflow-hidden opacity-70">
        <HeroVideo initialTokenId={featuredId} />
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
                Mint on Arbitrum for under $0.10 in gas, browse works ranked by community beauty scores, and collect on Axiom Zero when you are ready for the secondary market.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/mint"
                className="inline-flex h-12 items-center justify-center rounded-full border border-[#9b4aaf] bg-[#9b4aaf] px-7 text-sm font-bold tracking-wide text-white shadow-[0_0_24px_rgba(155,74,175,0.5)] transition hover:bg-[#8a3f9d] hover:shadow-[0_0_32px_rgba(155,74,175,0.65)]"
              >
                Mint the next work
              </Link>
              <Button asChild variant="outline" size="lg">
                <Link href="/gallery">Browse collection</Link>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <ExternalLink href={AXIOM_ZERO_MARKETPLACE_URL}>Collect on Axiom Zero</ExternalLink>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  label: "Current mint price",
                  value: stats.mintPrice != null ? formatEth(stats.mintPrice) : "Unavailable"
                },
                { label: "Minted", value: formatCompactNumber(stats.mintedCount) },
                { label: "Featured works", value: formatCompactNumber(stats.featuredTokenIds.length) }
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

          <Card className="overflow-hidden bg-background/55" data-testid="homepage-featured-panel">
            <CardContent className="space-y-6 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-muted-foreground">Featured now</p>
                  <Link href={`/detail/${featuredId}` as Route} className="mt-2 inline-block text-2xl font-semibold text-secondary transition hover:text-primary">
                    {formatId(featuredId)}
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
            as="h2"
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
                  <h3 className="text-2xl font-semibold">{item.title}</h3>
                  <p className="text-sm leading-7 text-muted-foreground">{item.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="cosmic-signature" className="scroll-mt-32">
          <Card className="overflow-hidden bg-card/70">
            <CardContent className="grid gap-8 p-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)] lg:p-8">
              <div className="space-y-6">
                <PageHeading
                  as="h2"
                  eyebrow={homepageCosmicSignature.eyebrow}
                  title={[
                    { text: "RANDOM WALK" },
                    { text: "MEETS", tone: "primary" },
                    { text: "COSMIC SIGNATURE", tone: "secondary" }
                  ]}
                  description={homepageCosmicSignature.description}
                />
                <div className="space-y-4 text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
                  <p>
                    Random Walk NFTs can be{" "}
                    <TermTooltip
                      id="cosmic-anchored"
                      term="anchored"
                      definition={homepageCosmicSignature.definitions.anchored}
                    />{" "}
                    on Cosmic Signature for{" "}
                    <TermTooltip
                      id="cosmic-anchored-selection"
                      term="Anchored-NFT Stellar Selection"
                      definition={homepageCosmicSignature.definitions.anchoredSelection}
                    />{" "}
                    eligibility.
                  </p>
                  <p>
                    An unused Random Walk NFT can also be attached to one ETH{" "}
                    <TermTooltip
                      id="cosmic-gesture"
                      term="gesture"
                      definition={homepageCosmicSignature.definitions.gesture}
                    />{" "}
                    to receive a 50%{" "}
                    <TermTooltip
                      id="cosmic-gesture-cost"
                      term="Gesture Cost"
                      definition={homepageCosmicSignature.definitions.gestureCost}
                    />{" "}
                    reduction when participating on that site.
                  </p>
                </div>
                <Button asChild variant="secondary" size="lg">
                  <ExternalLink href={homepageCosmicSignature.href} showIcon>
                    {homepageCosmicSignature.linkLabel}
                  </ExternalLink>
                </Button>
              </div>

              <div className="grid gap-4">
                {homepageCosmicSignature.utilityCards.map((item) => (
                  <div key={item.title} className="rounded-[1.25rem] border border-border/70 bg-background/45 p-5">
                    <p className="text-xs uppercase tracking-[0.24em] text-secondary">{item.eyebrow}</p>
                    <h3 className="mt-3 text-xl font-semibold">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.body}</p>
                  </div>
                ))}
                <div className="rounded-[1.25rem] border border-secondary/25 bg-secondary/10 p-5 text-sm leading-7 text-muted-foreground">
                  Selected Random Walk anchor-holders receive 1,000{" "}
                  <TermTooltip
                    id="cosmic-cst"
                    term="CST"
                    definition={homepageCosmicSignature.definitions.cst}
                  />{" "}
                  and one Cosmic Signature NFT each cycle.
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <PageHeading
            as="h2"
            eyebrow="Collector trust"
            title={[
              { text: "ON-CHAIN" },
              { text: "PROVENANCE", tone: "primary" },
              { text: "CLEARLY", tone: "secondary" }
            ]}
            description="Random Walk keeps the primary experience on this site: minting, browsing, media, provenance, and source code. Secondary collecting opens on Axiom Zero."
          />
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
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href="/faq">Read the collector FAQ</Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-8">
          <PageHeading
            as="h2"
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
                  <h3 className="text-2xl font-semibold">{item.title}</h3>
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
