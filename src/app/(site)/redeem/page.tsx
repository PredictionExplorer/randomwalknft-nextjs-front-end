import type { Metadata } from "next";

import { RedeemExperience } from "@/components/feature/redeem-experience";

export const metadata: Metadata = {
  title: "Redeem",
  description:
    "Claim ETH from the Random Walk NFT mint pool. If 30 days pass without a new mint, the last minter can withdraw half the accumulated pool.",
  alternates: { canonical: "/redeem" },
  openGraph: {
    title: "Redeem | Random Walk NFT",
    description:
      "Claim ETH from the Random Walk NFT mint pool. If 30 days pass without a new mint, the last minter can withdraw half the accumulated pool."
  }
};

export default function RedeemPage() {
  return <RedeemExperience />;
}
