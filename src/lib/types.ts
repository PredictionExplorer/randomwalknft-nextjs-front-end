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

type NftHistoryRecord = {
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
  assets: NftAssetUrls;
  tokenHistory: NftHistoryRecord[];
  mintedAt?: string | undefined;
  isPendingMetadata?: boolean | undefined;
};

export type CollectionQueryState = {
  address?: string | undefined;
  query?: number | undefined;
  sortBy: "tokenId" | "beauty";
  page: number;
  view: CollectionViewMode;
};

/**
 * Live state of the Vault game, read from the NFT contract (one Multicall3 round-trip
 * where available). `readAtMs` lets clients tick countdowns locally without hydration drift.
 * ETH values are provided both as display-friendly numbers and as exact wei strings.
 */
export type VaultState = {
  /** ETH claimable by the last minter (half the pool), in ether, for display. */
  prizeEth: number;
  /** Exact claimable amount in wei (decimal string; JSON-safe). */
  prizeWei: string;
  /** Seconds until the last minter may withdraw (0 when claimable now). */
  secondsUntilWithdrawal: number;
  /** Address of the current leader (last minter); undefined before first mint. */
  lastMinter?: string | undefined;
  /** Current mint price in ether, for display. */
  mintPriceEth?: number | undefined;
  /** Exact mint price in wei (decimal string). */
  mintPriceWei?: string | undefined;
  /** Total tokens minted. */
  mintedCount: number;
  /** Number of times the vault has ever been claimed. */
  numWithdrawals: number;
  /** Unix ms of the most recent mint — when the current keyholder took the key. */
  lastMintAtMs?: number | undefined;
  /** Unix ms timestamp of the server read, for client-side countdown seeding. */
  readAtMs: number;
};

/** One recent acquisition for the live feed. */
export type RecentMint = {
  id: number;
  minter: string;
  /** Unix ms of the mint, when the indexer knows it. */
  mintedAtMs?: number | undefined;
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
