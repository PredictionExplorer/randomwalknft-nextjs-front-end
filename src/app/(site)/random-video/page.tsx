import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { PageHeading } from "@/components/common/page-heading";
import { PageShell } from "@/components/common/page-shell";
import { ScreeningRoom } from "@/components/feature/random-room";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function RandomVideoPage() {
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
      <Suspense fallback={<Skeleton className="aspect-[1.6/1] w-full" />}>
        <ScreeningRoom />
      </Suspense>
    </PageShell>
  );
}
