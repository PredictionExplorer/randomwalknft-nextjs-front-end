export type AssetTheme = "black" | "white";
export type AssetVariant = "image" | "singleVideo" | "tripleVideo";
export type OfferKind = "buy" | "sell";
export type CollectionViewMode = "gallery" | "compact";
export type MarketplaceSort = "price-asc" | "price-desc" | "recent";

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
};

export type Offer = {
  id: number;
  offerId: number;
  tokenId: number;
  seller: string;
  buyer: string;
  price: number;
  active: boolean;
  createdAt: string;
  createdAtTimestamp: number;
  kind: OfferKind;
};

export type TradingRecord = {
  id: number;
  offerId: number;
  tokenId: number;
  seller: string;
  buyer: string;
  price: number;
  timestamp: number;
  createdAt: string;
  txHash: string;
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

export type MarketplaceQueryState = {
  filter: OfferKind;
  sort: MarketplaceSort;
  min?: number | undefined;
  max?: number | undefined;
  query?: number | undefined;
};

export type WalletConnectionState = {
  isConnected: boolean;
  hasInstalledWallet: boolean;
  isWrongNetwork: boolean;
  label: string;
  description: string;
};

export type HomepageStats = {
  mintedCount: number;
  activeListings: number;
  activeBids: number;
  recentSales: TradingRecord[];
  latestSalePrice?: number | undefined;
  featuredTokenIds: number[];
};

export type TrustSectionContent = {
  eyebrow: string;
  title: string;
  body: string;
  href?: string | undefined;
  linkLabel?: string | undefined;
};
