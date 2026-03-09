import type { Metadata } from "next";

import { RandomImageExperience } from "@/components/feature/random-image-experience";
import { getRandomTokenIds } from "@/lib/api/public";

export const metadata: Metadata = {
  title: "Random Image",
  description:
    "Discover Random Walk NFT artworks at random. Navigate through full-screen generative art images created from unique on-chain seeds on Arbitrum.",
  alternates: { canonical: "/random" },
  openGraph: {
    title: "Random Image | Random Walk NFT",
    description:
      "Discover Random Walk NFT artworks at random. Navigate through full-screen generative art images created from unique on-chain seeds on Arbitrum."
  }
};

export default async function RandomImagePage() {
  const ids = await getRandomTokenIds();
  const initialTokenId = ids[0] ?? 1;

  return <RandomImageExperience initialTokenId={initialTokenId} />;
}
