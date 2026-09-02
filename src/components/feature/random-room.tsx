import { randomUUID } from "node:crypto";
import { connection } from "next/server";

import { RandomImageExperience } from "@/components/feature/random-image-experience";
import { RandomVideoExperience } from "@/components/feature/random-video-experience";
import { getRandomMintedTokenIds } from "@/lib/api/public";
import { FEATURED_TOKEN_FALLBACK_ID } from "@/lib/featured-tokens";

/** Chance runs at request time: a new work and a fresh client tree on every visit. */
export async function RandomRoom() {
  await connection();
  const [initialTokenId = FEATURED_TOKEN_FALLBACK_ID] = await getRandomMintedTokenIds(1);
  return <RandomImageExperience key={randomUUID()} initialTokenId={initialTokenId} />;
}

export async function ScreeningRoom() {
  await connection();
  const [initialTokenId = FEATURED_TOKEN_FALLBACK_ID] = await getRandomMintedTokenIds(1);
  return <RandomVideoExperience key={randomUUID()} initialTokenId={initialTokenId} />;
}
