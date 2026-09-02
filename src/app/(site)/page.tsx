import Link from "next/link";
import type { Metadata } from "next";
import type { Route } from "next";

import { ExternalLink } from "@/components/common/external-link";
import { JsonLd } from "@/components/common/json-ld";
import { PageShell } from "@/components/common/page-shell";
import { AtelierStudio } from "@/components/feature/atelier-studio";
import { HeroExhibit } from "@/components/feature/hero-exhibit";
import { VaultRoom } from "@/components/feature/vault-room";
import { HoverVideoCard } from "@/components/nft/hover-video-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getHomepageStats, getRandomPair, getTokenInfo } from "@/lib/api/public";
import { faqItems } from "@/lib/content/faq";
import { homepageAnnex, homepageCharter } from "@/lib/content/homepage";
import { getBaseConfig } from "@/lib/config";
import { selectFeaturedTokens } from "@/lib/featured-tokens";
import { getAppConfig } from "@/lib/server/app-config";
import { arbiscanContractUrl, formatEth, formatId } from "@/lib/utils";

export const revalidate = 60;

export function generateMetadata(): Metadata {
  const { SITE_URL } = getBaseConfig();
  return {
    title: {
      absolute: "Random Walk NFT — a living museum of generative art on Arbitrum"
    },
    description:
      "A generative art collection running since 2021: every mint draws a unique artwork from an on-chain seed, released CC0, and feeds an ETH vault that pays the last minter. Browse the museum, watch walks being born, and take the key.",
    alternates: { canonical: `${SITE_URL}/` }
  };
}

function WallRow({
  title,
  subtitle,
  href,
  hrefLabel,
  ids,
  sublabels
}: {
  title: string;
  subtitle: string;
  href: Route;
  hrefLabel: string;
  ids: number[];
  sublabels?: ((id: number, index: number) => string) | undefined;
}) {
  if (ids.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h3 className="text-xl font-semibold tracking-[0.06em]">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <Link href={href} className="text-sm text-secondary transition hover:text-primary">
          {hrefLabel} →
        </Link>
      </div>
      <div className="flex snap-x gap-4 overflow-x-auto pb-2">
        {ids.map((id, index) => (
          <HoverVideoCard key={id} id={id} sublabel={sublabels?.(id, index)} />
        ))}
      </div>
    </div>
  );
}

export default async function HomePage() {
  const { NFT_ADDRESS, SITE_DESCRIPTION, SITE_NAME, SITE_URL } = await getAppConfig();
  const stats = await getHomepageStats();
  const { featuredId, featuredCards } = selectFeaturedTokens(stats.featuredTokenIds);
  const vault = stats.vault;

  let heroOwner: string | undefined;
  try {
    const info = await getTokenInfo(featuredId);
    heroOwner = info.TokenInfo.CurOwnerAddr;
  } catch {
    heroOwner = undefined;
  }

  let salonPair: [number, number] | null = null;
  try {
    const pair = await getRandomPair();
    if (Array.isArray(pair) && pair.length >= 2) {
      salonPair = [pair[0]!, pair[1]!];
    }
  } catch {
    salonPair = null;
  }

  const launchedYearsAgo = new Date().getUTCFullYear() - 2021;
  const prizeRatio =
    vault?.mintPriceEth && vault.mintPriceEth > 0 ? Math.round(vault.prizeEth / vault.mintPriceEth) : undefined;
  const exhibitionIds = stats.featuredTokenIds.filter((id) => !featuredCards.includes(id)).slice(0, 8);

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

      {/* 1. Entry Hall */}
      <section className="relative flex min-h-[calc(100svh-4.5rem)] flex-col justify-end overflow-hidden">
        <HeroExhibit initialTokenId={featuredId} initialOwner={heroOwner} />
        <PageShell className="relative z-10 pb-14 pt-40">
          <div className="max-w-3xl space-y-6">
            <p className="text-xs uppercase tracking-[0.32em] text-secondary/90">A living museum of generative art</p>
            <h1 className="flex flex-wrap gap-x-4 text-5xl font-semibold tracking-[0.1em] sm:text-6xl lg:text-7xl">
              <span className="text-primary">RANDOM</span>
              <span>WALK</span>
              <span className="text-secondary">NFT</span>
            </h1>
            <p className="max-w-2xl text-base leading-8 text-foreground/90 sm:text-lg">
              Random Walk NFT is a generative art collection on Arbitrum, running since 2021. Every mint draws a
              one-of-a-kind artwork from an on-chain seed, releases it to the public domain, and feeds a growing ETH
              vault that pays out to the last minter standing.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" variant="secondary">
                <Link href="/gallery">Enter the gallery</Link>
              </Button>
              <Link
                href="/mint"
                className="inline-flex h-12 items-center justify-center rounded-full border border-[#9b4aaf] bg-[#9b4aaf] px-7 text-sm font-bold tracking-wide text-white shadow-[0_0_24px_rgba(155,74,175,0.5)] transition hover:bg-[#8a3f9d] hover:shadow-[0_0_32px_rgba(155,74,175,0.65)]"
              >
                Mint a new work
              </Link>
            </div>
            <dl className="flex flex-wrap gap-x-10 gap-y-3 border-t border-white/10 pt-5 text-sm">
              <div>
                <dt className="text-[0.65rem] uppercase tracking-[0.28em] text-muted-foreground">
                  Works in the collection
                </dt>
                <dd className="mt-1 text-xl font-semibold tabular-nums">{stats.mintedCount.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-[0.65rem] uppercase tracking-[0.28em] text-muted-foreground">Current mint price</dt>
                <dd className="mt-1 text-xl font-semibold tabular-nums">
                  {stats.mintPrice != null ? formatEth(stats.mintPrice) : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[0.65rem] uppercase tracking-[0.28em] text-muted-foreground">In the vault</dt>
                <dd className="mt-1 text-xl font-semibold tabular-nums text-secondary">
                  {vault ? formatEth(vault.prizeEth, 2) : "—"}
                </dd>
              </div>
            </dl>
          </div>
        </PageShell>
      </section>

      <PageShell className="space-y-24 pb-24 pt-20">
        {/* 2. The Permanent Collection */}
        <section className="space-y-10" data-testid="homepage-wall">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.32em] text-secondary/80">The permanent collection</p>
            <h2 className="text-3xl font-semibold tracking-[0.08em] sm:text-4xl">
              {stats.mintedCount.toLocaleString()} WALKS ON THE WALL
            </h2>
            <p className="max-w-3xl text-base leading-7 text-muted-foreground">
              Each token is six works in one: a high-resolution still and two films — a single walker and a triple
              walker — each rendered on black and on white. Hover any frame to see it move.
            </p>
          </div>
          <WallRow
            title="The most beautiful"
            subtitle="Ranked by community votes in the Beauty Contest"
            href={"/gallery?sortBy=beauty"}
            hrefLabel="See the full ranking"
            ids={stats.beautyTopIds}
            sublabels={(_, index) => `Beauty rank #${index + 1}`}
          />
          <WallRow
            title="Newest acquisitions"
            subtitle="The latest walks to enter the museum"
            href="/gallery"
            hrefLabel="Walk the halls"
            ids={stats.newestIds}
            sublabels={() => "Recently minted"}
          />
          <WallRow
            title="Today's exhibition"
            subtitle="A fresh selection every day, drawn from the whole collection"
            href={"/random"}
            hrefLabel="View a random work"
            ids={exhibitionIds.length > 0 ? exhibitionIds : featuredCards}
          />
        </section>

        {/* 3. The Atelier */}
        <section className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="space-y-5">
            <p className="text-xs uppercase tracking-[0.32em] text-secondary/80">The atelier</p>
            <h2 className="text-3xl font-semibold tracking-[0.08em] sm:text-4xl">WHAT IS A RANDOM WALK?</h2>
            <p className="text-base leading-8 text-muted-foreground">
              A random walk is a path built one random step at a time — up, down, left, or right — repeated millions of
              times. Each Random Walk NFT starts from a seed created by your mint transaction and stored on-chain
              forever. A SHA3-256 hash stream turns that seed into steps, while three color channels drift alongside, so
              the shape and the palette of every work are born together from the same randomness.
            </p>
            <p className="text-base leading-8 text-muted-foreground">
              The canvas beside this text is not a recording — it is the real algorithm, drawing a fresh walk in your
              browser right now.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link href="/how-it-works">How it all works</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/code">Read the generator source</Link>
              </Button>
            </div>
          </div>
          <AtelierStudio />
        </section>

        {/* 4. The Vault */}
        <section
          id="vault"
          className="scroll-mt-32 rounded-3xl border border-secondary/20 bg-[radial-gradient(circle_at_20%_0%,rgba(198,118,215,0.12),transparent_45%)] p-6 sm:p-10"
        >
          <div className="space-y-8">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.32em] text-secondary/80">The vault</p>
              <h2 className="text-3xl font-semibold tracking-[0.08em] sm:text-4xl">HOW DOES THE VAULT GAME WORK?</h2>
              <p className="max-w-3xl text-base leading-8 text-muted-foreground">
                Every mint pays into a vault inside the smart contract — the creators take nothing. The most recent
                minter holds the vault&apos;s only key. If 30 days pass without a new mint, the keyholder may withdraw
                half of everything inside; any new mint resets the clock and takes the key.
                {vault && prizeRatio
                  ? ` Right now the vault holds ${vault.prizeEth.toFixed(2)} ETH — about ${prizeRatio}x the current mint price.`
                  : ""}
              </p>
            </div>
            {vault ? <VaultRoom initialVault={vault} /> : null}
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
              {vault?.numWithdrawals === 0
                ? `Sealed since 2021 · ${stats.mintedCount.toLocaleString()} mints in ${launchedYearsAgo} years · never opened`
                : vault
                  ? `Running since 2021 · ${stats.mintedCount.toLocaleString()} mints · opened ${vault.numWithdrawals} time${vault.numWithdrawals === 1 ? "" : "s"}`
                  : "Running since 2021"}
            </p>
          </div>
        </section>

        {/* 5. The Salon */}
        {salonPair ? (
          <section className="space-y-8">
            <div className="space-y-3 text-center">
              <p className="text-xs uppercase tracking-[0.32em] text-secondary/80">The salon</p>
              <h2 className="text-3xl font-semibold tracking-[0.08em] sm:text-4xl">WHICH IS MORE BEAUTIFUL?</h2>
              <p className="mx-auto max-w-2xl text-base leading-7 text-muted-foreground">
                The museum curates itself: visitors compare works two at a time, and every vote shapes the beauty
                ranking of the whole collection.
              </p>
            </div>
            <div className="mx-auto flex max-w-3xl items-center justify-center gap-4 sm:gap-8">
              <HoverVideoCard id={salonPair[0]} />
              <span className="text-sm uppercase tracking-[0.3em] text-muted-foreground">or</span>
              <HoverVideoCard id={salonPair[1]} />
            </div>
            <div className="text-center">
              <Button asChild size="lg" variant="secondary">
                <Link href="/compare">Cast your vote in the Beauty Contest</Link>
              </Button>
            </div>
          </section>
        ) : null}

        {/* 6. The Charter */}
        <section className="space-y-8">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.32em] text-secondary/80">The charter</p>
            <h2 className="text-3xl font-semibold tracking-[0.08em] sm:text-4xl">A MUSEUM THAT RUNS ITSELF</h2>
            <p className="max-w-3xl text-base leading-7 text-muted-foreground">
              No admin keys, no creator fees, no dependence on this website. These guarantees are enforced by the
              verified contract at{" "}
              <ExternalLink href={arbiscanContractUrl(NFT_ADDRESS)} className="break-all text-secondary">
                {NFT_ADDRESS}
              </ExternalLink>
              .
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {homepageCharter.map((item) => (
              <Card key={item.title} className="bg-card/70">
                <CardContent className="space-y-3 p-6">
                  <p className="text-xs uppercase tracking-[0.24em] text-secondary">{item.eyebrow}</p>
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="text-sm leading-7 text-muted-foreground">{item.body}</p>
                  {item.href && item.linkLabel ? (
                    item.href.startsWith("/") ? (
                      <Link
                        href={item.href as Route}
                        className="inline-block text-sm text-secondary transition hover:text-primary"
                      >
                        {item.linkLabel} →
                      </Link>
                    ) : (
                      <ExternalLink href={item.href} className="text-sm text-secondary transition hover:text-primary">
                        {item.linkLabel} →
                      </ExternalLink>
                    )
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 7. The Annex — Cosmic Signature */}
        <section>
          <Card className="overflow-hidden border-primary/20 bg-card/70">
            <CardContent className="grid gap-8 p-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)] lg:p-8">
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.32em] text-secondary/80">{homepageAnnex.eyebrow}</p>
                <h2 className="text-2xl font-semibold tracking-[0.06em] sm:text-3xl">{homepageAnnex.heading}</h2>
                <p className="text-base leading-8 text-muted-foreground">{homepageAnnex.body}</p>
                <Button asChild variant="secondary" size="lg">
                  <ExternalLink href={homepageAnnex.href} showIcon>
                    {homepageAnnex.linkLabel}
                  </ExternalLink>
                </Button>
              </div>
              <div className="grid gap-4">
                {homepageAnnex.cards.map((item) => (
                  <div key={item.title} className="rounded-[1.25rem] border border-border/70 bg-background/45 p-5">
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.body}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 8. Visitor's Guide */}
        <section className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.32em] text-secondary/80">Visitor&apos;s guide</p>
            <h2 className="text-3xl font-semibold tracking-[0.08em] sm:text-4xl">COMMON QUESTIONS</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {faqItems.slice(0, 6).map((item) => (
              <Link
                key={item.summary}
                href="/faq"
                className="group rounded-2xl border border-border/60 bg-card/50 p-5 transition hover:border-secondary/50"
              >
                <p className="font-semibold group-hover:text-secondary">{item.summary}</p>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{item.detail}</p>
              </Link>
            ))}
          </div>
          <Button asChild variant="outline">
            <Link href="/faq">Read the full FAQ</Link>
          </Button>
        </section>

        {/* 9. Final CTA */}
        <section className="rounded-3xl border border-border/60 bg-[radial-gradient(circle_at_80%_0%,rgba(155,74,175,0.16),transparent_55%)] p-8 text-center sm:p-12">
          <h2 className="text-3xl font-semibold tracking-[0.08em] sm:text-4xl">ADD A WALK TO THE COLLECTION</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            Minting creates a new seed no one has ever seen, hangs six new works in the museum
            {stats.mintPrice != null ? ` for ${formatEth(stats.mintPrice)}` : ""}, and hands you the key to the vault
            {vault ? ` — ${vault.prizeEth.toFixed(2)} ETH and counting` : ""}.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-4">
            <Link
              href="/mint"
              className="inline-flex h-12 items-center justify-center rounded-full border border-[#9b4aaf] bg-[#9b4aaf] px-8 text-sm font-bold tracking-wide text-white shadow-[0_0_24px_rgba(155,74,175,0.5)] transition hover:bg-[#8a3f9d] hover:shadow-[0_0_32px_rgba(155,74,175,0.65)]"
            >
              Mint the next work
            </Link>
            <Button asChild size="lg" variant="outline">
              <Link href="/vault">Visit the vault</Link>
            </Button>
          </div>
          <p className="mt-5 text-xs uppercase tracking-[0.24em] text-muted-foreground">
            Featured today: {formatId(featuredId)} · CC0 public domain · verified contract
          </p>
        </section>
      </PageShell>
    </div>
  );
}
