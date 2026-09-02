"use client";

import { useQuery } from "@tanstack/react-query";

import type { AssetVariant, NftAssetUrls } from "@/lib/types";
import { assetFileName, getAssetBySelection } from "@/lib/utils";

export type MediaAvailability = Record<AssetVariant, boolean>;

const ALL_MEDIA_READY: MediaAvailability = { image: true, singleVideo: true, tripleVideo: true };
const NO_MEDIA_READY: MediaAvailability = { image: false, singleVideo: false, tripleVideo: false };

/**
 * Asks our own asset proxy whether a file exists upstream. The proxy answers HEAD
 * with `X-Asset-Status: ready | placeholder | missing`, which the Go origin does not.
 */
async function probe(url: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/assets/${assetFileName(url)}`, { method: "HEAD", cache: "no-store" });
    return response.ok && response.headers.get("x-asset-status") === "ready";
  } catch {
    return false;
  }
}

/**
 * Freshly minted tokens exist on-chain before their six files are rendered. While
 * `pending`, poll the proxy for each variant of the requested edition; otherwise
 * report everything ready without touching the network.
 */
export function useMediaAvailability(assets: NftAssetUrls, edition: "black" | "white", pending: boolean) {
  const query = useQuery({
    queryKey: ["media-availability", assets.blackImage, edition],
    queryFn: async (): Promise<MediaAvailability> => {
      const [image, singleVideo, tripleVideo] = await Promise.all([
        probe(getAssetBySelection(assets, edition, "image")),
        probe(getAssetBySelection(assets, edition, "singleVideo")),
        probe(getAssetBySelection(assets, edition, "tripleVideo"))
      ]);
      return { image, singleVideo, tripleVideo };
    },
    enabled: pending,
    // Keep asking every 15s until every file is in place.
    refetchInterval: (state) => {
      const data = state.state.data;
      return data && data.image && data.singleVideo && data.tripleVideo ? false : 15_000;
    },
    staleTime: Number.POSITIVE_INFINITY
  });

  if (!pending) {
    return ALL_MEDIA_READY;
  }
  return query.data ?? NO_MEDIA_READY;
}
