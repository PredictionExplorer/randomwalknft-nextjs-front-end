import { getMissingEnvKeys, getPublicEnvSnapshot, type RequiredEnvKey } from "@/lib/env";
import { getApiBase } from "@/lib/server-rotation";

/** Path segments on the Go webserv origin (see websrv static / API routes). */
/** JSON API prefix on the Go webserv (RandomWalk NFT data). */
export const BACKEND_RANDOMWALK_API_PREFIX = "/api/randomwalk";
export const BACKEND_ASSET_PATH = "/images/randomwalk";

const DEFAULT_SITE_NAME = "Random Walk NFT";
const DEFAULT_SITE_DESCRIPTION =
  "A living museum of generative art on Arbitrum: every mint since 2021 draws a unique random-walk artwork from an on-chain seed, releases it CC0, and feeds an ETH vault that pays the last minter.";

export const AXIOM_ZERO_MARKETPLACE_URL = "https://www.axiomzero.market/random-walk";
export const COSMIC_SIGNATURE_URL = "https://cosmicsignature.com/";
export const CONTRACTS_GITHUB_URL = "https://github.com/PredictionExplorer/RandomWalkNftContracts";

function req(snap: Record<RequiredEnvKey, string | undefined>, name: RequiredEnvKey): string {
  const v = snap[name]?.trim();
  if (!v) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

function normalizeOrigin(url: string): string {
  return url.replace(/\/+$/, "");
}

/**
 * Canonical public URL for the Next.js app (metadata, JSON-LD, sitemap).
 */
function resolveSiteUrl(snap: Record<RequiredEnvKey, string | undefined>): string {
  return normalizeOrigin(req(snap, "NEXT_PUBLIC_SITE_URL"));
}

/** Site + API URLs. Backend origin is env; RandomWalk API + asset bases are derived. */
export type BaseEnvConfig = {
  SITE_URL: string;
  SITE_NAME: string;
  SITE_DESCRIPTION: string;
  API_BASE_URL: string;
  RWALK_BASE_URL: string;
  ASSET_BASE_URL: string;
};

export type AppConfig = BaseEnvConfig & {
  NFT_ADDRESS: `0x${string}`;
  MARKET_ADDRESS: `0x${string}`;
};

/**
 * Env-based config (no chain addresses). Use on client and anywhere contracts are not needed.
 *
 * Not cached across calls: `API_BASE_URL` (and the URLs derived from it) comes from the hourly
 * server rotation (`server-rotation.ts`), so it can change between calls — per clock hour, or
 * immediately after a failover.
 */
export function getBaseConfig(): BaseEnvConfig {
  const snap = getPublicEnvSnapshot();
  if (getMissingEnvKeys().length > 0) {
    throw new Error("ENV_NOT_CONFIGURED");
  }
  const origin = normalizeOrigin(getApiBase());
  return {
    SITE_URL: resolveSiteUrl(snap),
    SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME?.trim() || DEFAULT_SITE_NAME,
    SITE_DESCRIPTION: process.env.NEXT_PUBLIC_SITE_DESCRIPTION?.trim() || DEFAULT_SITE_DESCRIPTION,
    API_BASE_URL: origin,
    RWALK_BASE_URL: `${origin}${BACKEND_RANDOMWALK_API_PREFIX}`,
    ASSET_BASE_URL: `${origin}${BACKEND_ASSET_PATH}`
  };
}

export const SUPPORTED_ASSET_EXTENSIONS = [".png", ".jpg", ".jpeg", ".mp4", ".webp"] as const;

export const REVALIDATE_SHORT = 60;
export const REVALIDATE_MEDIUM = 300;
export const REVALIDATE_LONG = 1800;

export const PAGE_SIZE = 24;
