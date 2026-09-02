import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { ExternalLink } from "@/components/common/external-link";
import { PageHeading } from "@/components/common/page-heading";
import { PageShell } from "@/components/common/page-shell";
import { MintPanel } from "@/components/feature/mint-panel";
import { HoverVideoCard } from "@/components/nft/hover-video-card";
import { Button } from "@/components/ui/button";
import { getRandomMintedTokenIds, getVaultState } from "@/lib/api/public";
import { COSMIC_SIGNATURE_URL } from "@/lib/config";
import { getAppConfig } from "@/lib/server/app-config";
import { arbiscanContractUrl } from "@/lib/utils";

/** The featured rail must be resampled on every visit, including client navigations. */
export const dynamic = "force-dynamic";

const FEATURED_RAIL_COUNT = 8;

export const metadata: Metadata = {
  title: "Mint a new work — and take the vault key",
  description:
    "Mint a unique Random Walk NFT on Arbitrum: a one-of-a-kind generative artwork from an on-chain seed, six works per token, under $0.10 in gas. Every mint resets the vault's 30-day clock and makes you the keyholder.",
  alternates: { canonical: "/mint" },
  openGraph: {
    title: "Mint | Random Walk NFT",
    description:
      "Mint a unique Random Walk NFT on Arbitrum: six generative works from one on-chain seed — and the key to the ETH vault."
  }
};

const steps = [
  {
    title: "Sign one transaction",
    body: "Your wallet pays the mint price plus a fraction of a cent in gas. The contract draws 32 bytes of randomness and stores them as your token's seed, forever."
  },
  {
    title: "Watch it being born",
    body: "The walk draws itself live from that seed in your browser while the museum renders the high-resolution still and both films, in both editions."
  },
  {
    title: "Hold the key",
    body: "You are now the most recent minter. If nobody mints for 30 days, you may open the vault and take half of everything inside."
  }
];

export default async function MintPage() {
  noStore();
  const { NFT_ADDRESS } = await getAppConfig();
  const [featuredIds, vault] = await Promise.all([getRandomMintedTokenIds(FEATURED_RAIL_COUNT), getVaultState()]);

  return (
    <PageShell className="space-y-14 py-12">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Mint" }]} />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:gap-16">
        <div className="space-y-8">
          <PageHeading
            eyebrow="The ticket desk"
            title="Add a walk nobody has seen."
            description="Minting creates a seed no one has ever seen, renders six new works from it, resets the vault's 30-day clock, and makes you the keyholder."
          />
          <MintPanel initialVault={vault} />
        </div>

        <div className="space-y-4">
          <p className="eyebrow">Recently drawn by chance</p>
          <div className="grid grid-cols-2 gap-3" data-testid="mint-featured-rail">
            {featuredIds.map((id) => (
              <HoverVideoCard key={id} id={id} />
            ))}
          </div>
          <p className="text-xs leading-6 text-muted-foreground">
            Eight works from the collection, resampled on every visit. Yours will look like none of them.
          </p>
        </div>
      </div>

      <section className="space-y-8 border-t border-border pt-12" aria-labelledby="mint-steps-heading">
        <div className="space-y-3">
          <p className="eyebrow text-accent">What happens</p>
          <h2 id="mint-steps-heading" className="font-display text-3xl sm:text-4xl">
            Three steps, one transaction.
          </h2>
        </div>
        <ol className="grid gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="space-y-3 bg-background p-6">
              <p className="font-mono text-xs text-muted-foreground">0{index + 1}</p>
              <h3 className="font-display text-2xl">{step.title}</h3>
              <p className="text-sm leading-7 text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-8 border-t border-border pt-12 md:grid-cols-3" aria-label="What you receive">
        <div className="space-y-2">
          <p className="eyebrow">What you receive</p>
          <p className="text-sm leading-7 text-muted-foreground">
            A CC0 on-chain token: the seed, the provenance, the naming rights, and six works from one seed — a still and
            two films, each on black and on white.
          </p>
        </div>
        <div className="space-y-2">
          <p className="eyebrow">Beyond the museum</p>
          <p className="text-sm leading-7 text-muted-foreground">
            Random Walk NFTs earn rewards when anchored in{" "}
            <ExternalLink href={COSMIC_SIGNATURE_URL} className="text-foreground">
              Cosmic Signature
            </ExternalLink>{" "}
            and halve the cost of one ETH gesture there.
          </p>
        </div>
        <div className="space-y-2">
          <p className="eyebrow">Verified and immutable</p>
          <p className="text-sm leading-7 text-muted-foreground">
            The contract at{" "}
            <ExternalLink
              href={arbiscanContractUrl(NFT_ADDRESS)}
              className="break-all font-mono text-xs text-foreground"
            >
              {NFT_ADDRESS}
            </ExternalLink>{" "}
            has no admin keys and no creator fees. Read every rule before you sign.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/atelier">Try the generator first</Link>
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
