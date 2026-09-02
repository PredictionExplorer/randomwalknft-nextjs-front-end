import type { Metadata } from "next";
import { randomUUID } from "node:crypto";
import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { PageHeading } from "@/components/common/page-heading";
import { PageShell } from "@/components/common/page-shell";
import { RandomImageExperience } from "@/components/feature/random-image-experience";
import { getRandomMintedTokenIds } from "@/lib/api/public";
import { FEATURED_TOKEN_FALLBACK_ID } from "@/lib/featured-tokens";

/** Client navigations must not reuse a cached RSC payload with a stale random token. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "A random work",
  description:
    "Discover Random Walk NFT artworks at random. Navigate through full-screen generative art images created from unique on-chain seeds on Arbitrum.",
  alternates: { canonical: "/random" },
  openGraph: {
    title: "A random work | Random Walk NFT",
    description:
      "Discover Random Walk NFT artworks at random. Navigate through full-screen generative art images created from unique on-chain seeds on Arbitrum."
  }
};

export default async function RandomImagePage() {
  noStore();
  const [initialTokenId = FEATURED_TOKEN_FALLBACK_ID] = await getRandomMintedTokenIds(1);
  // New key every server render so the client tree remounts on each visit (avoids stale hook state).
  const visitKey = randomUUID();

  return (
    <PageShell className="space-y-8 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3">
          <Breadcrumbs
            items={[
              { href: "/", label: "Home" },
              { href: "/gallery", label: "Collection" },
              { label: "A random work" }
            ]}
          />
          <PageHeading
            eyebrow="Wander"
            title="A random work."
            description="Let chance choose. Press → for another; ← to go back."
          />
        </div>
        <Link href="/random-video" className="eyebrow hover:text-foreground">
          Prefer the films? →
        </Link>
      </div>
      <RandomImageExperience key={visitKey} initialTokenId={initialTokenId} />
    </PageShell>
  );
}
