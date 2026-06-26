import type { Metadata } from "next";
import { randomUUID } from "node:crypto";
import { unstable_noStore as noStore } from "next/cache";

import { RandomImageExperience } from "@/components/feature/random-image-experience";
import { getRandomTokenIdsFresh } from "@/lib/api/public";
import { selectFeaturedTokens } from "@/lib/featured-tokens";

/** Client navigations must not reuse a cached RSC payload with a stale random token. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Random Image",
  description:
    "Discover Random Walk NFT artworks at random. Navigate through full-screen generative art images created from unique on-chain seeds on Arbitrum.",
  alternates: { canonical: "/random" },
  openGraph: {
    title: "Random Image | Random Walk NFT",
    description:
      "Discover Random Walk NFT artworks at random. Navigate through full-screen generative art images created from unique on-chain seeds on Arbitrum."
  }
};

export default async function RandomImagePage() {
  noStore();
  const ids = await getRandomTokenIdsFresh();
  const { featuredId: initialTokenId } = selectFeaturedTokens(ids);
  // New key every server render so the client tree remounts on each visit (avoids stale hook state).
  const visitKey = randomUUID();

  return <RandomImageExperience key={visitKey} initialTokenId={initialTokenId} />;
}
