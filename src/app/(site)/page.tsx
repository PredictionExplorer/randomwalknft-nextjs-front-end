import Link from "next/link";
import type { Metadata } from "next";
import type { Route } from "next";

import { PageHeading } from "@/components/common/page-heading";
import { PageShell } from "@/components/common/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getRandomTokenIds } from "@/lib/api/public";
import { SITE_DESCRIPTION } from "@/lib/config";
import { createAssetUrls, formatId } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Home",
  description: SITE_DESCRIPTION
};

export default async function HomePage() {
  const [featuredId] = await getRandomTokenIds();
  const assets = createAssetUrls(featuredId ?? 1);

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[min(80vh,54rem)] overflow-hidden opacity-80">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute left-1/2 top-24 h-auto min-w-full -translate-x-1/2 object-cover opacity-55"
        >
          <source src={assets.blackTripleVideo} type="video/mp4" />
        </video>
      </div>

      <PageShell className="flex min-h-[calc(100vh-11rem)] flex-col justify-center py-16 sm:py-24">
        <div className="max-w-3xl space-y-8">
          <PageHeading
            title={[
              { text: "RANDOM", tone: "primary" },
              { text: "WALK" },
              { text: "NFT", tone: "secondary" }
            ]}
            description="On-chain CC0 NFTs built from the random walk mathematical process. Minting ETH flows back to minters through a novel on-chain incentive design."
          />

          <div className="max-w-2xl space-y-3 text-base leading-7 text-muted-foreground">
            <p>Explore image and video outputs generated from each NFT seed.</p>
            <p>Trade on the built-in 0.00% fee marketplace or mint the next work directly on Arbitrum.</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/mint"
              className="inline-flex h-12 items-center justify-center rounded-full border border-secondary bg-secondary px-6 text-sm font-medium text-[#140a1f] transition hover:bg-secondary/90"
              style={{ color: "#140a1f" }}
            >
              Mint now
            </Link>
            <Button asChild variant="outline" size="lg">
              <Link href={`/detail/${featuredId ?? 1}` as Route}>View {formatId(featuredId ?? 1)}</Link>
            </Button>
          </div>
        </div>

        <Card className="mt-12 max-w-2xl bg-background/45">
          <CardContent className="flex flex-wrap items-center gap-4 p-5">
            <span className="text-xs uppercase tracking-[0.32em] text-muted-foreground">Featured now</span>
            <Link href={`/detail/${featuredId ?? 1}` as Route} className="text-secondary transition hover:text-primary">
              {formatId(featuredId ?? 1)}
            </Link>
          </CardContent>
        </Card>
      </PageShell>
    </div>
  );
}
