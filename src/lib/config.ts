import { getPublicEnvSnapshot, REQUIRED_ENV_KEYS, type RequiredEnvKey } from "@/lib/env";

function req(snap: Record<RequiredEnvKey, string | undefined>, name: RequiredEnvKey): string {
  const v = snap[name]?.trim();
  if (!v) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

export type AppConfig = {
  SITE_URL: string;
  SITE_NAME: string;
  SITE_DESCRIPTION: string;
  NFT_ADDRESS: `0x${string}`;
  MARKET_ADDRESS: `0x${string}`;
  API_BASE_URL: string;
  RWALK_BASE_URL: string;
  ASSET_BASE_URL: string;
};

let cached: AppConfig | null = null;

/**
 * Resolved lazily. Call only when the app shell is mounted (env validated in root layout).
 * Throws if any required variable is missing — use only after {@link isEnvConfigured} / layout gate.
 */
export function getConfig(): AppConfig {
  if (cached) {
    return cached;
  }
  const snap = getPublicEnvSnapshot();
  const missing = REQUIRED_ENV_KEYS.filter((key) => {
    const v = snap[key];
    return typeof v !== "string" || v.trim() === "";
  });
  if (missing.length > 0) {
    throw new Error("ENV_NOT_CONFIGURED");
  }
  cached = {
    SITE_URL: req(snap, "NEXT_PUBLIC_SITE_URL"),
    SITE_NAME: req(snap, "NEXT_PUBLIC_SITE_NAME"),
    SITE_DESCRIPTION: req(snap, "NEXT_PUBLIC_SITE_DESCRIPTION"),
    NFT_ADDRESS: req(snap, "NEXT_PUBLIC_NFT_ADDRESS") as `0x${string}`,
    MARKET_ADDRESS: req(snap, "NEXT_PUBLIC_MARKET_ADDRESS") as `0x${string}`,
    API_BASE_URL: req(snap, "NEXT_PUBLIC_API_BASE_URL"),
    RWALK_BASE_URL: req(snap, "NEXT_PUBLIC_RWALK_BASE_URL"),
    ASSET_BASE_URL: req(snap, "NEXT_PUBLIC_ASSET_BASE_URL")
  };
  return cached;
}

export const SUPPORTED_ASSET_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".mp4",
  ".webp"
] as const;

export const REVALIDATE_SHORT = 60;
export const REVALIDATE_MEDIUM = 300;
export const REVALIDATE_LONG = 1800;

export const PAGE_SIZE = 24;
