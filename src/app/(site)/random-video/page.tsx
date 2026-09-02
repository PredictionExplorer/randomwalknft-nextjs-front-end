import type { Metadata } from "next";
import { randomUUID } from "node:crypto";
import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { PageHeading } from "@/components/common/page-heading";
import { PageShell } from "@/components/common/page-shell";
import { RandomVideoExperience } from "@/components/feature/random-video-experience";
import { getRandomMintedTokenIds } from "@/lib/api/public";
import { FEATURED_TOKEN_FALLBACK_ID } from "@/lib/featured-tokens";

/** Same as /random: client navigations must remount so useRandomTokenHistory refetches /api/random-token. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The screening room",
  description:
    "Watch Random Walk NFT motion artworks at random. Each video is generated from a unique on-chain seed using a mathematical random walk algorithm.",
  alternates: { canonical: "/random-video" },
  openGraph: {
    title: "The screening room | Random Walk NFT",
    description:
      "Watch Random Walk NFT motion artworks at random. Each video is generated from a unique on-chain seed using a mathematical random walk algorithm."
  }
};

export default async function RandomVideoPage() {
  noStore();
  const [initialTokenId = FEATURED_TOKEN_FALLBACK_ID] = await getRandomMintedTokenIds(1);
  const visitKey = randomUUID();

  return (
    <PageShell className="space-y-8 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3">
          <Breadcrumbs
            items={[
              { href: "/", label: "Home" },
              { href: "/gallery", label: "Collection" },
              { label: "The screening room" }
            ]}
          />
          <PageHeading
            eyebrow="Wander"
            title="The screening room."
            description="Each film shows a single walker drawing its work. When one ends, another begins."
          />
        </div>
        <Link href="/random" className="eyebrow hover:text-foreground">
          Prefer the stills? →
        </Link>
      </div>
      <RandomVideoExperience key={visitKey} initialTokenId={initialTokenId} />
    </PageShell>
  );
}
