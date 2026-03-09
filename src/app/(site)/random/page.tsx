import type { Metadata } from "next";

import { RandomImageExperience } from "@/components/feature/random-image-experience";
import { getRandomTokenIds } from "@/lib/api/public";

export const metadata: Metadata = {
  title: "Random Image"
};

export default async function RandomImagePage() {
  const ids = await getRandomTokenIds();
  const initialTokenId = ids[0] ?? 1;

  return <RandomImageExperience initialTokenId={initialTokenId} />;
}
