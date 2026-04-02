import type { Metadata } from "next";
import { randomUUID } from "node:crypto";
import nextDynamic from "next/dynamic";
import { unstable_noStore as noStore } from "next/cache";

import { PageShell } from "@/components/common/page-shell";
import { Skeleton } from "@/components/ui/skeleton";

/** Same as /random: client navigations must remount so useRandomTokenHistory refetches /api/random-token. */
export const dynamic = "force-dynamic";

const RandomVideoExperience = nextDynamic(
  () => import("@/components/feature/random-video-experience").then((mod) => mod.RandomVideoExperience),
  {
    loading: () => (
      <PageShell className="py-16">
        <Skeleton className="aspect-video w-full" />
      </PageShell>
    )
  }
);

export const metadata: Metadata = {
  title: "Random Video",
  description:
    "Watch Random Walk NFT motion artworks at random. Each video is generated from a unique on-chain seed using a mathematical random walk algorithm.",
  alternates: { canonical: "/random-video" },
  openGraph: {
    title: "Random Video | Random Walk NFT",
    description:
      "Watch Random Walk NFT motion artworks at random. Each video is generated from a unique on-chain seed using a mathematical random walk algorithm."
  }
};

export default function RandomVideoPage() {
  noStore();
  const visitKey = randomUUID();
  return <RandomVideoExperience key={visitKey} />;
}
