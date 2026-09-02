import type { Metadata, Route } from "next";
import Link from "next/link";

import { ExternalLink } from "@/components/common/external-link";
import { JsonLd } from "@/components/common/json-ld";
import { PageShell } from "@/components/common/page-shell";
import { ConstellationMap } from "@/components/feature/constellation-map";
import { VaultChapter } from "@/components/feature/vault-chapter";
import { WalkStory } from "@/components/feature/walk-story";
import { HoverVideoCard } from "@/components/nft/hover-video-card";
import { NftCard } from "@/components/nft/nft-card";
import { Button } from "@/components/ui/button";
import { getHomepageStats, getRandomPair, getRatingOrder, getRecentMints } from "@/lib/api/public";
import { getBaseConfig } from "@/lib/config";
import { faqItems } from "@/lib/content/faq";
import { homepageAnnex, homepageCharter } from "@/lib/content/homepage";
import { selectFeaturedTokens } from "@/lib/featured-tokens";
import { getAppConfig } from "@/lib/server/app-config";
import { arbiscanContractUrl, formatEth } from "@/lib/utils";

export const revalidate = 60;

export function generateMetadata(): Metadata {
  const { SITE_URL } = getBaseConfig();
  return {
    title: {
      absolute: "Random Walk NFT — generative art drawn by chance, on Arbitrum since 2021"
    },
    description:
      "Every Random Walk NFT is drawn from an on-chain seed by a SHA3-256 random walk, released CC0, and feeds an ETH vault that pays the last minter. Watch a walk being born as you scroll, explore the whole collection, and take the key.",
    alternates: { canonical: `${SITE_URL}/` }
  };
}

const RECENT_MINTS = 6;

function WallRow({
  title,
  subtitle,
  href,
  hrefLabel,
  ids,
  sublabels,
  testId
}: {
  title: string;
  subtitle: string;
  href: Route;
  hrefLabel: string;
  ids: number[];
  sublabels?: ((id: number, index: number) => string) | undefined;
  testId?: string;
}) {
  if (ids.length === 0) {
    return null;
  }

  return (
    <div className="min-w-0 space-y-4" data-testid={testId}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h3 className="font-display text-2xl">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <Link href={href} className="eyebrow transition-colors hover:text-foreground">
          {hrefLabel} →
        </Link>
      </div>
      <div className="flex snap-x gap-4 overflow-x-auto pb-2 [scrollbar-width:thin]">
        {ids.map((id, index) => (
          <HoverVideoCard key={id} id={id} sublabel={sublabels?.(id, index)} />
        ))}
      </div>
    </div>
  );
}

export default async function HomePage() {
  const { NFT_ADDRESS, SITE_DESCRIPTION, SITE_NAME, SITE_URL } = await getAppConfig();
  const [stats, ratingOrder, recentMints, pair] = await Promise.all([
    getHomepageStats(),
    getRatingOrder().catch(() => [] as number[]),
    getRecentMints(RECENT_MINTS).catch(() => []),
    getRandomPair().catch(() => [] as number[])
  ]);
  const { featuredCards } = selectFeaturedTokens(stats.featuredTokenIds);
  const vault = stats.vault;
  const salonPair: [number, number] | null = pair.length >= 2 ? [pair[0]!, pair[1]!] : null;
  const exhibitionIds = stats.featuredTokenIds.filter((id) => !featuredCards.includes(id)).slice(0, 8);
  const newestId = stats.mintedCount > 0 ? stats.mintedCount - 1 : undefined;
  const launchedYearsAgo = new Date().getUTCFullYear() - 2021;

  return (
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE_NAME,
          url: SITE_URL,
          description: SITE_DESCRIPTION,
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${SITE_URL}/gallery?query={search_term_string}`
            },
            "query-input": "required name=search_term_string"
          }
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
          logo: `${SITE_URL}/images/logo2.png`,
          foundingDate: "2021",
          description: SITE_DESCRIPTION,
          sameAs: [
            "https://twitter.com/RandomWalkNFT",
            "https://discord.gg/bGnPn96Qwt",
            "https://github.com/PredictionExplorer/RandomWalkNftContracts",
            arbiscanContractUrl(NFT_ADDRESS)
          ]
        }}
      />

      {/* Masthead */}
      <PageShell className="flex flex-col gap-6 border-b border-border py-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-5xl leading-none sm:text-6xl">Random Walk NFT</h1>
          <p className="mt-3 max-w-xl text-pretty text-base leading-7 text-muted-foreground">
            A generative art collection on Arbitrum, running since 2021. Every work is drawn by chance from an on-chain
            seed, released to the public domain, and feeds a vault that pays the last minter standing.
          </p>
        </div>
        <dl className="grid grid-cols-3 gap-x-8 gap-y-1 font-mono text-xs sm:text-right" data-testid="masthead-facts">
          <dt className="eyebrow col-start-1 row-start-2">Works</dt>
          <dd className="col-start-1 row-start-1 text-lg tabular-nums text-foreground">
            {stats.mintedCount.toLocaleString()}
          </dd>
          <dt className="eyebrow col-start-2 row-start-2">Mint price</dt>
          <dd className="col-start-2 row-start-1 text-lg tabular-nums text-foreground">
            {stats.mintPrice != null ? formatEth(stats.mintPrice) : "—"}
          </dd>
          <dt className="eyebrow col-start-3 row-start-2">In the vault</dt>
          <dd className="col-start-3 row-start-1 text-lg tabular-nums text-accent">
            {vault ? formatEth(vault.prizeEth, 2) : "—"}
          </dd>
        </dl>
      </PageShell>

      {/* Chapters I–IV: the walk draws itself */}
      <WalkStory mintedCount={stats.mintedCount} />

      <PageShell className="space-y-28 pb-28 pt-24">
        {/* Chapter V: the collection */}
        <section className="space-y-12" aria-labelledby="collection-heading" data-testid="homepage-wall">
          <div className="space-y-3">
            <p className="eyebrow text-accent">Chapter V · The collection</p>
            <h2 id="collection-heading" className="font-display text-4xl sm:text-5xl">
              {stats.mintedCount.toLocaleString()} walks, and counting.
            </h2>
            <p className="max-w-2xl text-pretty text-base leading-7 text-muted-foreground">
              Each token is six works in one: a high-resolution still and two films — a single walker and a triple
              walker — each rendered on black and on white. Hover any frame to see it move; switch wings to see the
              other edition.
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
            <ConstellationMap
              count={stats.mintedCount}
              beautyOrder={ratingOrder}
              newestId={newestId}
              featuredIds={stats.featuredTokenIds}
              className="min-w-0"
            />
            <div className="min-w-0 space-y-10">
              <WallRow
                title="The most beautiful"
                subtitle="Ranked by visitors in the Beauty Contest"
                href={"/gallery?sortBy=beauty"}
                hrefLabel="Full ranking"
                ids={stats.beautyTopIds}
                sublabels={(_, index) => `Beauty rank #${index + 1}`}
              />
              <WallRow
                title="Newest acquisitions"
                subtitle="The latest walks to enter the collection"
                href="/gallery"
                hrefLabel="Browse everything"
                ids={stats.newestIds}
                sublabels={() => "Recently minted"}
              />
              <WallRow
                title="Today's exhibition"
                subtitle="A fresh selection every day, drawn from the whole collection"
                href={"/random"}
                hrefLabel="Show me a random work"
                ids={exhibitionIds.length > 0 ? exhibitionIds : featuredCards}
                testId="wall-row-exhibition"
              />
            </div>
          </div>
        </section>

        {/* Chapter VI: the vault */}
        {vault ? (
          <section
            id="vault"
            className="scroll-mt-24 space-y-12 border-t border-border pt-20"
            aria-labelledby="vault-heading"
          >
            <div className="space-y-3">
              <p className="eyebrow text-accent">Chapter VI · The vault</p>
              <h2 id="vault-heading" className="font-display text-4xl sm:text-5xl">
                Every mint pays into a vault. The last minter holds the key.
              </h2>
              <p className="max-w-2xl text-pretty text-base leading-7 text-muted-foreground">
                If 30 days pass without a new mint, whoever minted last may withdraw half of everything inside. Any new
                mint resets the clock and takes the key.{" "}
                {vault.numWithdrawals === 0
                  ? `In ${launchedYearsAgo} years and ${stats.mintedCount.toLocaleString()} mints, the clock has never reached zero.`
                  : `The vault has opened ${vault.numWithdrawals} time${vault.numWithdrawals === 1 ? "" : "s"} since 2021.`}
              </p>
            </div>
            <VaultChapter vault={vault} recentMints={recentMints} keyholderTokenId={newestId} />
          </section>
        ) : null}

        {/* The salon */}
        {salonPair ? (
          <section className="space-y-8 border-t border-border pt-20" aria-labelledby="salon-heading">
            <div className="space-y-3 text-center">
              <p className="eyebrow text-accent">The salon</p>
              <h2 id="salon-heading" className="font-display text-4xl sm:text-5xl">
                Which is more beautiful?
              </h2>
              <p className="mx-auto max-w-xl text-pretty text-base leading-7 text-muted-foreground">
                The collection curates itself: visitors compare works two at a time, and every vote shapes the beauty
                ranking.
              </p>
            </div>
            <div className="mx-auto grid max-w-3xl items-center gap-4 sm:grid-cols-[1fr_auto_1fr] sm:gap-6">
              <NftCard id={salonPair[0]} href={`/detail/${salonPair[0]}`} />
              <span className="eyebrow text-center">or</span>
              <NftCard id={salonPair[1]} href={`/detail/${salonPair[1]}`} />
            </div>
            <div className="text-center">
              <Button asChild size="lg">
                <Link href="/compare">Cast your vote</Link>
              </Button>
            </div>
          </section>
        ) : null}

        {/* The charter */}
        <section className="space-y-10 border-t border-border pt-20" aria-labelledby="charter-heading">
          <div className="space-y-3">
            <p className="eyebrow text-accent">The charter</p>
            <h2 id="charter-heading" className="font-display text-4xl sm:text-5xl">
              A collection that runs itself.
            </h2>
            <p className="max-w-2xl text-pretty text-base leading-7 text-muted-foreground">
              No admin keys, no creator fees, no dependence on this website. These guarantees are enforced by the
              verified contract at{" "}
              <ExternalLink
                href={arbiscanContractUrl(NFT_ADDRESS)}
                className="break-all font-mono text-xs text-foreground"
              >
                {NFT_ADDRESS}
              </ExternalLink>
              .
            </p>
          </div>
          <div className="grid gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-2">
            {homepageCharter.map((item) => (
              <article key={item.title} className="space-y-3 bg-background p-6 sm:p-8">
                <p className="eyebrow">{item.eyebrow}</p>
                <h3 className="font-display text-2xl">{item.title}</h3>
                <p className="text-sm leading-7 text-muted-foreground">{item.body}</p>
                {item.href && item.linkLabel ? (
                  item.href.startsWith("/") ? (
                    <Link href={item.href as Route} className="eyebrow inline-block text-foreground hover:text-accent">
                      {item.linkLabel} →
                    </Link>
                  ) : (
                    <ExternalLink href={item.href} className="eyebrow text-foreground hover:text-accent">
                      {item.linkLabel} →
                    </ExternalLink>
                  )
                ) : null}
              </article>
            ))}
          </div>
        </section>

        {/* The annex */}
        <section
          className="grid gap-8 border-t border-border pt-20 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)]"
          aria-labelledby="annex-heading"
        >
          <div className="space-y-4">
            <p className="eyebrow text-accent">{homepageAnnex.eyebrow}</p>
            <h2 id="annex-heading" className="font-display text-4xl sm:text-5xl">
              {homepageAnnex.heading}
            </h2>
            <p className="max-w-xl text-pretty text-base leading-7 text-muted-foreground">{homepageAnnex.body}</p>
            <Button asChild variant="outline" size="lg" className="h-auto whitespace-normal py-3 text-left">
              <ExternalLink href={homepageAnnex.href} showIcon>
                {homepageAnnex.linkLabel}
              </ExternalLink>
            </Button>
          </div>
          <div className="grid gap-px overflow-hidden rounded-md border border-border bg-border">
            {homepageAnnex.cards.map((item) => (
              <div key={item.title} className="bg-background p-5">
                <h3 className="font-display text-xl">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Visitor's guide */}
        <section className="space-y-8 border-t border-border pt-20" aria-labelledby="guide-heading">
          <div className="space-y-3">
            <p className="eyebrow text-accent">Visitor&apos;s guide</p>
            <h2 id="guide-heading" className="font-display text-4xl sm:text-5xl">
              Common questions
            </h2>
          </div>
          <div className="grid gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-2">
            {faqItems.slice(0, 6).map((item) => (
              <Link
                key={item.summary}
                href="/faq"
                className="group bg-background p-5 transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              >
                <p className="font-medium group-hover:text-accent">{item.summary}</p>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{item.detail}</p>
              </Link>
            ))}
          </div>
          <Button asChild variant="outline">
            <Link href="/faq">Read the full FAQ</Link>
          </Button>
        </section>

        {/* Final CTA */}
        <section className="border-t border-border pt-20 text-center" aria-labelledby="cta-heading">
          <p className="eyebrow text-accent">Add a step</p>
          <h2 id="cta-heading" className="font-display mt-3 text-4xl sm:text-6xl">
            Add a walk to the collection.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-7 text-muted-foreground">
            Minting creates a seed no one has ever seen, renders six new works from it
            {stats.mintPrice != null ? ` for ${formatEth(stats.mintPrice)}` : ""}, and hands you the key to the vault
            {vault ? ` — ${vault.prizeEth.toFixed(2)} ETH and counting` : ""}.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="accent" size="lg">
              <Link href="/mint">Mint the next work</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/atelier">Try the Atelier first</Link>
            </Button>
          </div>
          <p className="eyebrow mt-6">CC0 public domain · verified contract · running since 2021</p>
        </section>
      </PageShell>
    </div>
  );
}
