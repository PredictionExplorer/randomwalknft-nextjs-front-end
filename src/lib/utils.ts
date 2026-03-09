import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

import { ASSET_BASE_URL } from "@/lib/config";
import type { AssetTheme, AssetVariant, NftAssetUrls } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatId(id: number | string) {
  return `#${id.toString().padStart(6, "0")}`;
}

export function shortenAddress(address: string, length = 4) {
  return `${address.slice(0, length + 2)}...${address.slice(-length)}`;
}

export function formatEth(value: number, fractionDigits = 4) {
  return `${value.toFixed(fractionDigits)} ETH`;
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: value < 1000 ? 0 : 1
  }).format(value);
}

export function formatDateFromUnix(timestamp: number) {
  return format(new Date(timestamp * 1000), "MMMM d, yyyy");
}

export function formatDateTimeFromUnix(timestamp: number) {
  return format(new Date(timestamp * 1000), "MMM d, yyyy 'at' h:mm a");
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w ]+/g, " ")
    .replace(/\s+/g, "-");
}

export function getAssetUrl(fileName: string) {
  return `${ASSET_BASE_URL}/${fileName}`;
}

export function getAssetProxyUrl(fileName: string) {
  return `/api/assets/${fileName}`;
}

export function createAssetUrls(tokenId: number): NftAssetUrls {
  const fileName = tokenId.toString().padStart(6, "0");

  return {
    blackImage: getAssetProxyUrl(`${fileName}_black.png`),
    blackThumb: getAssetProxyUrl(`${fileName}_black_thumb.jpg`),
    blackSingleVideo: getAssetProxyUrl(`${fileName}_black_single.mp4`),
    blackTripleVideo: getAssetProxyUrl(`${fileName}_black_triple.mp4`),
    whiteImage: getAssetProxyUrl(`${fileName}_white.png`),
    whiteThumb: getAssetProxyUrl(`${fileName}_white_thumb.jpg`),
    whiteSingleVideo: getAssetProxyUrl(`${fileName}_white_single.mp4`),
    whiteTripleVideo: getAssetProxyUrl(`${fileName}_white_triple.mp4`)
  };
}

export function getAssetBySelection(
  assets: NftAssetUrls,
  theme: AssetTheme,
  variant: AssetVariant
) {
  if (variant === "image") {
    return theme === "black" ? assets.blackImage : assets.whiteImage;
  }
  if (variant === "singleVideo") {
    return theme === "black" ? assets.blackSingleVideo : assets.whiteSingleVideo;
  }
  return theme === "black" ? assets.blackTripleVideo : assets.whiteTripleVideo;
}

export function getAssetPreview(assets: NftAssetUrls, theme: AssetTheme) {
  return theme === "black" ? assets.blackThumb : assets.whiteThumb;
}

export function getAssetImage(assets: NftAssetUrls, theme: AssetTheme) {
  return theme === "black" ? assets.blackImage : assets.whiteImage;
}
