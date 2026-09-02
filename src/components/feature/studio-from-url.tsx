import { AtelierStudio } from "@/components/feature/atelier-studio";
import { isSeedHex } from "@/lib/walk/walk-engine";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Only the studio depends on the URL; the rest of the Atelier page stays static. */
export async function StudioFromUrl({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const rawSeed = typeof params.seed === "string" ? params.seed : undefined;
  return <AtelierStudio initialSeed={rawSeed && isSeedHex(rawSeed) ? rawSeed : undefined} />;
}
