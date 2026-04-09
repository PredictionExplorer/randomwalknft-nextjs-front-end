import type { Metadata } from "next";
import { randomUUID } from "node:crypto";
import { unstable_noStore as noStore } from "next/cache";

import { RandomImageExperience } from "@/components/feature/random-image-experience";
import { getRandomTokenIdsFresh } from "@/lib/api/public";

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

function pickStartingTokenFromExplorePool(ids: number[]): number {
  if (ids.length === 0) return 1;
  // Backend explore/random orders by fewest ranking matches, then rating, then token_id ASC
  // — so ids[0] is almost always 0. Shuffle pick for a "random image" first paint.
  const i = Math.floor(Math.random() * ids.length);
  return ids[i]!;
}

export default async function RandomImagePage() {
  noStore();
  const ids = await getRandomTokenIdsFresh();
  const initialTokenId = pickStartingTokenFromExplorePool(ids);
  // New key every server render so the client tree remounts on each visit (avoids stale hook state).
  const visitKey = randomUUID();

  return <RandomImageExperience key={visitKey} initialTokenId={initialTokenId} />;
}
