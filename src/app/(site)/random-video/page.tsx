import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { PageShell } from "@/components/common/page-shell";
import { Skeleton } from "@/components/ui/skeleton";

const RandomVideoExperience = dynamic(
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
  return <RandomVideoExperience />;
}
