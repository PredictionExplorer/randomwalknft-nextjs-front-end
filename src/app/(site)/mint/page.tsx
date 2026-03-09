import type { Metadata } from "next";

import { MintExperience } from "@/components/feature/mint-experience";
import { getRandomTokenIds } from "@/lib/api/public";

export const metadata: Metadata = {
  title: "Mint"
};

export default async function MintPage() {
  const featuredIds = await getRandomTokenIds();
  return <MintExperience featuredIds={featuredIds} />;
}
