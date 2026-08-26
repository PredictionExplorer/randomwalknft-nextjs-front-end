import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";

import { MintExperience } from "@/components/feature/mint-experience";
import { getRandomMintedTokenIds } from "@/lib/api/public";

/** The featured rail must be resampled on every visit, including client navigations. */
export const dynamic = "force-dynamic";

const FEATURED_RAIL_COUNT = 12;

export const metadata: Metadata = {
  title: "Mint a new work — and take the vault key",
  description:
    "Mint a unique Random Walk NFT on Arbitrum: a one-of-a-kind generative artwork from an on-chain seed, six works per token, under $0.10 in gas. Every mint resets the vault's 30-day clock and makes you the keyholder.",
  alternates: { canonical: "/mint" },
  openGraph: {
    title: "Mint | Random Walk NFT",
    description:
      "Mint a unique Random Walk NFT on Arbitrum: six generative works from one on-chain seed — and the key to the ETH vault."
  }
};

export default async function MintPage() {
  noStore();
  const featuredIds = await getRandomMintedTokenIds(FEATURED_RAIL_COUNT);
  return <MintExperience featuredIds={featuredIds} />;
}
