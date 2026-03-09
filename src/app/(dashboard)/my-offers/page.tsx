import type { Metadata } from "next";

import { MyOffersView } from "@/components/feature/my-offers-view";

export const metadata: Metadata = {
  title: "My Offers",
  description:
    "View and manage your active buy and sell offers on the Random Walk NFT marketplace. Cancel offers or check their status.",
  robots: { index: false, follow: true }
};

export default function MyOffersPage() {
  return <MyOffersView />;
}
