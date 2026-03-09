export type AssetTheme = "black" | "white";
export type AssetVariant = "image" | "singleVideo" | "tripleVideo";
export type OfferKind = "buy" | "sell";

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

export type BlogPost = {
  id: number;
  title: string;
  epic: string;
  content: string;
  bannerImage: string;
  thumbImage: string;
  slug: string;
  status: boolean;
  createdAt: number;
};

export type AuthSession = {
  email: string;
  token: string;
};

export type WalletActionState = {
  status: "idle" | "pending" | "success" | "error";
  message?: string;
  hash?: `0x${string}`;
};
