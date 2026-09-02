import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { PageShell } from "@/components/common/page-shell";
import { CompareExperience } from "@/components/feature/compare-experience";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "The Salon — which Random Walk is more beautiful?",
  description:
    "Vote between two Random Walk NFTs to rank the collection by community beauty scores. Help decide which generative artworks are the most visually compelling.",
  alternates: { canonical: "/compare" },
  openGraph: {
    title: "The Salon | Random Walk NFT",
    description:
      "Vote between two Random Walk NFTs to rank the collection by community beauty scores. Help decide which generative artworks are the most visually compelling."
  }
};

export default function ComparePage() {
  return (
    <PageShell className="space-y-12 py-12">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "The Salon" }]} />
      <CompareExperience />
      <section className="grid gap-8 border-t border-border pt-10 md:grid-cols-3" aria-label="About the salon">
        <div className="space-y-2">
          <p className="eyebrow">Why it matters</p>
          <p className="text-sm leading-7 text-muted-foreground">
            Nobody curates this collection. Visitors do, two works at a time. The ranking you build here hangs in the
            gallery&apos;s most beautiful room and on every work&apos;s page.
          </p>
        </div>
        <div className="space-y-2">
          <p className="eyebrow">How votes are counted</p>
          <p className="text-sm leading-7 text-muted-foreground">
            Each vote is a message signed by your wallet, so it costs nothing and cannot be forged. One vote per pair
            per wallet; the indexer tallies wins into a beauty score.
          </p>
        </div>
        <div className="space-y-2">
          <p className="eyebrow">See the result</p>
          <Button asChild variant="outline" size="sm">
            <Link href="/gallery?sortBy=beauty">Open the most beautiful room</Link>
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
