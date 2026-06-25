export type AssetTheme = "black" | "white";
export type AssetVariant = "image" | "singleVideo" | "tripleVideo";
export type CollectionViewMode = "gallery" | "compact";

export type NftAssetUrls = {
  blackImage: string;
  blackThumb: string;
  blackSingleVideo: string;
  blackTripleVideo: string;
  whiteImage: string;
  whiteThumb: string;
  whiteSingleVideo: string;
  whiteTripleVideo: string;
};

export type NftHistoryRecord = {
  recordType: number;
  blockNumber?: number | undefined;
  timestamp: number;
  dateTime: string;
  owner?: string | undefined;
  seller?: string | undefined;
  buyer?: string | undefined;
  price?: number | undefined;
  offerId?: number | undefined;
};

export type Nft = {
  id: number;
  name: string;
  owner: string;
  seed: string;
  rating: number;
  assets: NftAssetUrls;
  tokenHistory: NftHistoryRecord[];
  mintedAt?: string | undefined;
  isPendingMetadata?: boolean | undefined;
};

export type WalletActionState = {
  status: "idle" | "pending" | "success" | "error";
  message?: string | undefined;
  hash?: `0x${string}` | undefined;
};

export type CollectionQueryState = {
  address?: string | undefined;
  query?: number | undefined;
  sortBy: "tokenId" | "beauty";
  page: number;
  view: CollectionViewMode;
};

export type HomepageStats = {
  mintedCount: number;
  mintPrice?: number | undefined;
  featuredTokenIds: number[];
};

export type TrustSectionContent = {
  eyebrow: string;
  title: string;
  body: string;
  href?: string | undefined;
  linkLabel?: string | undefined;
};
