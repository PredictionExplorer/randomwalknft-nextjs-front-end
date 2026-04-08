import { getPublicEnvSnapshot, REQUIRED_ENV_KEYS, type RequiredEnvKey } from "@/lib/env";

/** Path segments on the Go webserv origin (see websrv static / API routes). */
/** JSON API prefix on the Go webserv (RandomWalk NFT data). */
export const BACKEND_RANDOMWALK_API_PREFIX = "/api/randomwalk";
export const BACKEND_ASSET_PATH = "/images/randomwalk";

const DEFAULT_SITE_NAME = "Random Walk NFT";
const DEFAULT_SITE_DESCRIPTION =
  "On-chain generative art: each NFT is a unique random walk, minted and traded on Arbitrum.";

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
 * Override with NEXT_PUBLIC_SITE_URL when the dev port or host differs.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    return explicit;
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return `https://${vercel}`;
  }
  return "http://localhost:3000";
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

let baseCached: BaseEnvConfig | null = null;

/**
 * Env-based config (no chain addresses). Use on client and anywhere contracts are not needed.
 */
export function getBaseConfig(): BaseEnvConfig {
  if (baseCached) {
    return baseCached;
  }
  const snap = getPublicEnvSnapshot();
  const missing = REQUIRED_ENV_KEYS.filter((key) => {
    const v = snap[key];
    return typeof v !== "string" || v.trim() === "";
  });
  if (missing.length > 0) {
    throw new Error("ENV_NOT_CONFIGURED");
  }
  const origin = normalizeOrigin(req(snap, "NEXT_PUBLIC_API_BASE_URL"));
  baseCached = {
    SITE_URL: resolveSiteUrl(),
    SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME?.trim() || DEFAULT_SITE_NAME,
    SITE_DESCRIPTION: process.env.NEXT_PUBLIC_SITE_DESCRIPTION?.trim() || DEFAULT_SITE_DESCRIPTION,
    API_BASE_URL: origin,
    RWALK_BASE_URL: `${origin}${BACKEND_RANDOMWALK_API_PREFIX}`,
    ASSET_BASE_URL: `${origin}${BACKEND_ASSET_PATH}`
  };
  return baseCached;
}

export const SUPPORTED_ASSET_EXTENSIONS = [".png", ".jpg", ".jpeg", ".mp4", ".webp"] as const;

export const REVALIDATE_SHORT = 60;
export const REVALIDATE_MEDIUM = 300;
export const REVALIDATE_LONG = 1800;

export const PAGE_SIZE = 24;
