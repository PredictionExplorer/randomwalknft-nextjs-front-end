import { connection } from "next/server";

import { HoverVideoCard } from "@/components/nft/hover-video-card";
import { Skeleton } from "@/components/ui/skeleton";
import { getRandomMintedTokenIds } from "@/lib/api/public";

const FEATURED_RAIL_COUNT = 8;

/** Resampled on every visit: runs at request time inside its own Suspense boundary. */
export async function FeaturedRail() {
  await connection();
  const featuredIds = await getRandomMintedTokenIds(FEATURED_RAIL_COUNT);
  return (
    <div className="grid grid-cols-2 gap-3" data-testid="mint-featured-rail">
      {featuredIds.map((id) => (
        <HoverVideoCard key={id} id={id} />
      ))}
    </div>
  );
}

export function FeaturedRailSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3" aria-busy>
      {Array.from({ length: FEATURED_RAIL_COUNT }, (_, index) => (
        <Skeleton key={index} className="aspect-[1.6/1] w-full" />
      ))}
    </div>
  );
}
