import type { Metadata } from "next";

import { MyNftsView } from "@/components/feature/my-nfts-view";

export const metadata: Metadata = {
  title: "My NFTs"
};

export default function MyNftsPage() {
  return <MyNftsView />;
}
