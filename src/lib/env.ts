/**
 * All deployment-specific values must come from the shell / .env — no hardcoded defaults.
 * See .env.example for the full list.
 */
export const REQUIRED_ENV_KEYS = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_SITE_NAME",
  "NEXT_PUBLIC_SITE_DESCRIPTION",
  "NEXT_PUBLIC_NFT_ADDRESS",
  "NEXT_PUBLIC_MARKET_ADDRESS",
  "NEXT_PUBLIC_API_BASE_URL",
  "NEXT_PUBLIC_RWALK_BASE_URL",
  "NEXT_PUBLIC_ASSET_BASE_URL"
] as const;

export type RequiredEnvKey = (typeof REQUIRED_ENV_KEYS)[number];

/**
 * Each NEXT_PUBLIC_* must be read with a static `process.env.NEXT_PUBLIC_*` expression.
 * Dynamic `process.env[key]` is not inlined in client bundles, so it is always undefined
 * in the browser and breaks getConfig() / Wagmi even when .env.local is correct.
 */
export function getPublicEnvSnapshot(): Record<RequiredEnvKey, string | undefined> {
  return {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
    NEXT_PUBLIC_SITE_DESCRIPTION: process.env.NEXT_PUBLIC_SITE_DESCRIPTION,
    NEXT_PUBLIC_NFT_ADDRESS: process.env.NEXT_PUBLIC_NFT_ADDRESS,
    NEXT_PUBLIC_MARKET_ADDRESS: process.env.NEXT_PUBLIC_MARKET_ADDRESS,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_RWALK_BASE_URL: process.env.NEXT_PUBLIC_RWALK_BASE_URL,
    NEXT_PUBLIC_ASSET_BASE_URL: process.env.NEXT_PUBLIC_ASSET_BASE_URL
  };
}

export function getMissingEnvKeys(): RequiredEnvKey[] {
  const snap = getPublicEnvSnapshot();
  return REQUIRED_ENV_KEYS.filter((key) => {
    const v = snap[key];
    return typeof v !== "string" || v.trim() === "";
  });
}

export function isEnvConfigured(): boolean {
  return getMissingEnvKeys().length === 0;
}
