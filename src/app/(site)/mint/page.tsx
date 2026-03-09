import type { Metadata } from "next";

import { MintExperience } from "@/components/feature/mint-experience";
import { getRandomTokenIds } from "@/lib/api/public";

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
  const featuredIds = await getRandomTokenIds();
  return <MintExperience featuredIds={featuredIds} />;
}
