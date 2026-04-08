import { AnimatedList } from "@/components/common/animated-list";
import { EmptyState } from "@/components/common/empty-state";
import { NftCard } from "@/components/nft/nft-card";
import { createAssetUrls } from "@/lib/utils";
import type { CollectionViewMode } from "@/lib/types";

export function NftGrid({
  ids,
  emptyMessage = "Nothing found.",
  emptyDescription = "Try adjusting your filters or search criteria.",
  view = "gallery",
  /** Large lists (e.g. My NFTs): skip `AnimatedList` so cards are not stuck at opacity 0 with huge stagger delays. */
  disableAnimation = false
}: {
  ids: number[];
  emptyMessage?: string;
  emptyDescription?: string;
  view?: CollectionViewMode;
  disableAnimation?: boolean;
}) {
  if (!ids.length) {
    return <EmptyState title={emptyMessage} description={emptyDescription} />;
  }

  const gridClass =
    view === "compact"
      ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
      : "grid gap-6 md:grid-cols-2 xl:grid-cols-3";

  const cards = ids.map((id) => (
    <NftCard key={id} id={id} image={createAssetUrls(id).blackThumb} href={`/detail/${id}`} compact={view === "compact"} />
  ));

  if (disableAnimation) {
    return <div className={gridClass}>{cards}</div>;
  }

  return <AnimatedList className={gridClass}>{cards}</AnimatedList>;
}
