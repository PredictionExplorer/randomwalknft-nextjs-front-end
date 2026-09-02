import Link from "next/link";
import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { ExternalLink } from "@/components/common/external-link";
import { JsonLd } from "@/components/common/json-ld";
import { PageShell } from "@/components/common/page-shell";
import { AtelierStudio } from "@/components/feature/atelier-studio";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getVaultState } from "@/lib/api/public";
import { COSMIC_SIGNATURE_URL, CONTRACTS_GITHUB_URL, getBaseConfig } from "@/lib/config";
import { getAppConfig } from "@/lib/server/app-config";
import { arbiscanContractUrl } from "@/lib/utils";

export const revalidate = 300;

const PAGE_TITLE = "How Random Walk NFT works — the art, the algorithm, and the Vault game";
const PAGE_DESCRIPTION =
  "A complete explanation of Random Walk NFT: how on-chain seeds become generative artworks through a SHA3-256 random walk, how the last-minter Vault game pays collectors, why the rules can never change, and how to verify everything yourself.";

export const metadata: Metadata = {
  title: { absolute: `${PAGE_TITLE} | Random Walk NFT` },
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/how-it-works" },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    type: "article"
  }
};

export default async function HowItWorksPage() {
  const { NFT_ADDRESS, SITE_NAME, SITE_URL } = await getAppConfig();
  const { SITE_DESCRIPTION } = getBaseConfig();
  const vault = await getVaultState();
  const launchedYearsAgo = new Date().getUTCFullYear() - 2021;
  const ratio =
    vault?.mintPriceEth && vault.mintPriceEth > 0 ? Math.round(vault.prizeEth / vault.mintPriceEth) : undefined;

  return (
    <PageShell className="space-y-16 py-16">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: PAGE_TITLE,
          description: PAGE_DESCRIPTION,
          url: `${SITE_URL}/how-it-works`,
          dateModified: new Date().toISOString(),
          author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
          publisher: {
            "@type": "Organization",
            name: SITE_NAME,
            url: SITE_URL,
            logo: { "@type": "ImageObject", url: `${SITE_URL}/images/logo2.png` }
          },
          about: SITE_DESCRIPTION
        }}
      />
      <div className="space-y-8">
        <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "How It Works" }]} />
        <div className="max-w-3xl space-y-5">
          <p className="text-xs uppercase tracking-[0.32em] text-secondary/80">The full story</p>
          <h1 className="text-4xl font-semibold tracking-[0.08em] sm:text-5xl">HOW RANDOM WALK NFT WORKS</h1>
          <p className="text-lg leading-8 text-muted-foreground">
            Random Walk NFT is a generative art collection and an on-chain game, live on Arbitrum since 2021. Minting
            creates a unique seed that becomes six artworks, and every mint feeds an ETH vault that pays the last minter
            standing. This page explains the whole system — and how to verify every claim yourself.
          </p>
        </div>
      </div>

      <section className="max-w-3xl space-y-4">
        <h2 className="text-2xl font-semibold tracking-[0.06em] sm:text-3xl">What exactly is minted?</h2>
        <p className="text-base leading-8 text-muted-foreground">
          When you mint, the contract records a fresh 32-byte seed against your token id — data that could not be known
          before the transaction confirmed. That seed is the artwork&apos;s DNA. From it, an open-source generator
          produces a high-resolution still image and two films (a single walker and a triple walker), each rendered on
          black and on white — six works per token. The token itself carries the seed, the provenance, on-chain naming
          rights, and a place in the Vault game.
        </p>
      </section>

      <section className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-[0.06em] sm:text-3xl">How does a seed become art?</h2>
          <p className="text-base leading-8 text-muted-foreground">
            The generator hashes the seed with SHA3-256, over and over, producing an endless stream of random bits. Two
            bits at a time choose a direction — right, left, up, or down — and the path walks millions of steps until it
            fills a 1.6:1 canvas. In parallel, three color channels each take a small random step per walk step; after
            normalization they become the RGB color of every point. Shape and palette are therefore born from the same
            randomness — no human curates the outcome.
          </p>
          <p className="text-base leading-8 text-muted-foreground">
            The canvas on this page runs the identical algorithm in your browser at miniature resolution, on a fresh
            random seed each time.
          </p>
          <Button asChild variant="outline">
            <Link href="/code">Read the full generator source</Link>
          </Button>
        </div>
        <AtelierStudio compact />
      </section>

      <section className="max-w-3xl space-y-4">
        <h2 className="text-2xl font-semibold tracking-[0.06em] sm:text-3xl">How does the Vault game work?</h2>
        <p className="text-base leading-8 text-muted-foreground">
          Every wei paid for minting goes into the contract — the creators take nothing. The most recent minter holds
          the vault&apos;s only key. If 30 days pass without a new mint, the keyholder may withdraw half of everything
          inside; the other half stays and seeds the next round. Any new mint resets the clock to 30 days and takes the
          key.
        </p>
        <p className="text-base leading-8 text-muted-foreground">
          Because the pool accumulates every mint while the price rises only gradually, the prize stays several hundred
          times the current mint price.
          {vault && ratio
            ? ` As of today the vault holds ${vault.prizeEth.toFixed(2)} ETH against a mint price of ${vault.mintPriceEth?.toFixed(4)} ETH — a ratio of about ${ratio}x.`
            : ""}{" "}
          {vault?.numWithdrawals === 0
            ? `In ${launchedYearsAgo} years and ${vault.mintedCount.toLocaleString()} mints, the clock has never reached zero — the vault has never been opened.`
            : ""}
        </p>
        <Button asChild variant="secondary">
          <Link href="/vault">See the live vault</Link>
        </Button>
      </section>

      <section className="max-w-3xl space-y-4">
        <h2 className="text-2xl font-semibold tracking-[0.06em] sm:text-3xl">How does the mint price grow?</h2>
        <p className="text-base leading-8 text-muted-foreground">
          The price increases about 0.1% with every mint — a factor of 1.001, which compounds to a doubling roughly
          every 693 mints. There is no supply cap; the rising price is the only limit. This curve is why the game must
          eventually end: at some point minting becomes so expensive that nobody dethrones the keyholder for 30 days,
          and the vault opens for the last minter.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-[0.06em] sm:text-3xl">Why can&apos;t the rules change?</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            {
              title: "Immutable contract",
              body: "The contract has no admin keys and no upgrade path. The rules deployed in 2021 are the rules today, and nobody can change them — including the creators."
            },
            {
              title: "Zero creator fees",
              body: "No mint revenue goes to the team. Their only stake is the tokens they minted early, at the same prices and rules as everyone else."
            },
            {
              title: "CC0 public domain",
              body: "All artwork is free for anyone to use, remix, or sell. Ownership on-chain is what collectors hold: seed, provenance, name, and game position."
            },
            {
              title: "Art that outlives the website",
              body: "The generator is open source and pinned on IPFS. Anyone can regenerate every artwork from on-chain seeds, so the art survives even if this site disappears."
            }
          ].map((item) => (
            <Card key={item.title}>
              <CardContent className="space-y-2 p-5">
                <p className="text-lg font-semibold">{item.title}</p>
                <p className="text-sm leading-7 text-muted-foreground">{item.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="max-w-3xl space-y-4">
        <h2 className="text-2xl font-semibold tracking-[0.06em] sm:text-3xl">
          What can you do with a Random Walk NFT?
        </h2>
        <p className="text-base leading-8 text-muted-foreground">
          Collect it, name it on-chain, vote in the{" "}
          <Link href="/compare" className="text-secondary transition hover:text-primary">
            Beauty Contest
          </Link>
          , trade it on{" "}
          <ExternalLink
            href="https://www.axiomzero.market/random-walk"
            className="text-secondary transition hover:text-primary"
          >
            Axiom Zero
          </ExternalLink>
          , or play the Vault game by minting. Beyond this site, Random Walk NFTs have live utility in{" "}
          <ExternalLink href={COSMIC_SIGNATURE_URL} className="text-secondary transition hover:text-primary">
            Cosmic Signature
          </ExternalLink>
          , a related on-chain art protocol by the same team: anchor a token there — without selling it — to become
          eligible for Stellar Selection rewards (1,000 CST and a Cosmic Signature NFT), or attach an unused token to
          one ETH gesture for a one-time 50% discount.
        </p>
      </section>

      <section className="max-w-3xl space-y-4">
        <h2 className="text-2xl font-semibold tracking-[0.06em] sm:text-3xl">How can I verify all of this myself?</h2>
        <p className="text-base leading-8 text-muted-foreground">
          Don&apos;t trust this page — check it. The NFT contract is verified at{" "}
          <ExternalLink href={arbiscanContractUrl(NFT_ADDRESS)} className="break-all text-secondary">
            {NFT_ADDRESS}
          </ExternalLink>{" "}
          on Arbiscan, where every rule described here is readable in the source. The contract repository is public on{" "}
          <ExternalLink href={CONTRACTS_GITHUB_URL} className="text-secondary">
            GitHub
          </ExternalLink>
          , and the art generator — with pinned dependencies and instructions — is published on the{" "}
          <Link href="/code" className="text-secondary">
            Open Source page
          </Link>{" "}
          and on IPFS. Live numbers on this page are read directly from the chain.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Button asChild size="lg">
            <Link href="/mint">Mint a work</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/gallery">Browse the museum</Link>
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
