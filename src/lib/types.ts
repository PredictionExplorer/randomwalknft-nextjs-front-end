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

/**
 * Live state of the Vault game, read from the NFT contract in one multicall.
 * `readAtMs` lets clients tick countdowns locally without hydration drift.
 */
export type VaultState = {
  /** ETH claimable by the last minter (half the pool), in ether. */
  prizeEth: number;
  /** Seconds until the last minter may withdraw (0 when claimable now). */
  secondsUntilWithdrawal: number;
  /** Address of the current leader (last minter); undefined before first mint. */
  lastMinter?: string | undefined;
  /** Current mint price in ether. */
  mintPriceEth?: number | undefined;
  /** Total tokens minted. */
  mintedCount: number;
  /** Number of times the vault has ever been claimed. */
  numWithdrawals: number;
  /** Unix ms timestamp of the server read, for client-side countdown seeding. */
  readAtMs: number;
};

export type HomepageStats = {
  mintedCount: number;
  mintPrice?: number | undefined;
  featuredTokenIds: number[];
  /** Top token ids by community beauty score (best first). */
  beautyTopIds: number[];
  /** Newest token ids (most recent mint first). */
  newestIds: number[];
  vault: VaultState | null;
};

export type TrustSectionContent = {
  eyebrow: string;
  title: string;
  body: string;
  href?: string | undefined;
  linkLabel?: string | undefined;
};
