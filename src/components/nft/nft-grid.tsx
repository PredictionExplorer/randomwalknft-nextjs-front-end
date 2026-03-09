import { NftCard } from "@/components/nft/nft-card";
import { createAssetUrls } from "@/lib/utils";

export function NftGrid({
  ids,
  emptyMessage = "Nothing found."
}: {
  ids: number[];
  emptyMessage?: string;
}) {
  if (!ids.length) {
    return <div className="rounded-[1.5rem] border border-dashed border-border px-6 py-12 text-center text-muted-foreground">{emptyMessage}</div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {ids.map((id) => (
        <NftCard key={id} id={id} image={createAssetUrls(id).blackThumb} href={`/detail/${id}`} />
      ))}
    </div>
  );
}
