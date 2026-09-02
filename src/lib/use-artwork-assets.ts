"use client";

import { useWingEdition } from "@/components/providers/wing-provider";
import type { AssetTheme } from "@/lib/types";
import { createAssetUrls } from "@/lib/utils";

export type EditionAssets = {
  edition: AssetTheme;
  image: string;
  thumb: string;
  singleVideo: string;
  tripleVideo: string;
};

/** Asset URLs for one token in the requested edition. */
function editionAssets(id: number, edition: AssetTheme): EditionAssets {
  const assets = createAssetUrls(id);
  return edition === "white"
    ? {
        edition,
        image: assets.whiteImage,
        thumb: assets.whiteThumb,
        singleVideo: assets.whiteSingleVideo,
        tripleVideo: assets.whiteTripleVideo
      }
    : {
        edition,
        image: assets.blackImage,
        thumb: assets.blackThumb,
        singleVideo: assets.blackSingleVideo,
        tripleVideo: assets.blackTripleVideo
      };
}

/** The artwork files that match the wing the visitor is standing in. */
export function useArtworkAssets(id: number, override?: AssetTheme): EditionAssets {
  const edition = useWingEdition();
  return editionAssets(id, override ?? edition);
}
