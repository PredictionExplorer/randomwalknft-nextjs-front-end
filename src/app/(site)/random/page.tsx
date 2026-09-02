import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { PageHeading } from "@/components/common/page-heading";
import { PageShell } from "@/components/common/page-shell";
import { RandomRoom } from "@/components/feature/random-room";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function RandomImagePage() {
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
      <Suspense fallback={<Skeleton className="aspect-[1.6/1] w-full" />}>
        <RandomRoom />
      </Suspense>
    </PageShell>
  );
}
