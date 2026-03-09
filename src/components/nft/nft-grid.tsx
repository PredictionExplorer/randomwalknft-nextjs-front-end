import { NftCard } from "@/components/nft/nft-card";
import { createAssetUrls } from "@/lib/utils";
import type { CollectionViewMode } from "@/lib/types";

export function NftGrid({
  ids,
  emptyMessage = "Nothing found.",
  view = "gallery"
}: {
  ids: number[];
  emptyMessage?: string;
  view?: CollectionViewMode;
}) {
  if (!ids.length) {
    return <div className="rounded-[1.5rem] border border-dashed border-border px-6 py-12 text-center text-muted-foreground">{emptyMessage}</div>;
  }

  return (
    <div className={view === "compact" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5" : "grid gap-6 md:grid-cols-2 xl:grid-cols-3"}>
      {ids.map((id) => (
        <NftCard key={id} id={id} image={createAssetUrls(id).blackThumb} href={`/detail/${id}`} compact={view === "compact"} />
      ))}
    </div>
  );
}
