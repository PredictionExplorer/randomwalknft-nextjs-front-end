import type { Metadata } from "next";

import { MyNftsView } from "@/components/feature/my-nfts-view";

export const metadata: Metadata = {
  title: "My NFTs",
  description:
    "View and manage the Random Walk NFTs in your connected wallet. List tokens for sale or transfer them to another address.",
  robots: { index: false, follow: true }
};

export default function MyNftsPage() {
  return <MyNftsView />;
}
