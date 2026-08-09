import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";

import { MintExperience } from "@/components/feature/mint-experience";
import { getRandomMintedTokenIds } from "@/lib/api/public";

/** The featured rail must be resampled on every visit, including client navigations. */
export const dynamic = "force-dynamic";

const FEATURED_RAIL_COUNT = 12;

export const metadata: Metadata = {
  title: "Mint",
  description:
    "Mint a unique Random Walk NFT on Arbitrum. Each mint creates a one-of-a-kind generative artwork from an on-chain seed for under $0.10 in gas.",
  alternates: { canonical: "/mint" },
  openGraph: {
    title: "Mint | Random Walk NFT",
    description:
      "Mint a unique Random Walk NFT on Arbitrum. Each mint creates a one-of-a-kind generative artwork from an on-chain seed for under $0.10 in gas."
  }
};

export default async function MintPage() {
  noStore();
  const featuredIds = await getRandomMintedTokenIds(FEATURED_RAIL_COUNT);
  return <MintExperience featuredIds={featuredIds} />;
}
