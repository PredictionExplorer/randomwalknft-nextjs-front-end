/**
 * Required public env: set in the **process environment** before `next dev` / `next build`
 * (e.g. `export …` in the shell, or your host’s env UI). All three must be non-empty.
 *
 * Contract addresses: GET {API}/api/randomwalk/contracts (and see `rwalk-contracts.ts` for env shortcuts on non-local networks).
 */

export const REQUIRED_ENV_KEYS = [
  "NEXT_PUBLIC_NETWORK",
  "NEXT_PUBLIC_API_BASE_URL",
  "NEXT_PUBLIC_RPC_URL"
] as const;

export type RequiredEnvKey = (typeof REQUIRED_ENV_KEYS)[number];

const VALID_NETWORKS = new Set(["local", "sepolia", "mainnet"]);

/**
 * Static `process.env.NEXT_PUBLIC_*` reads — required for client bundle inlining.
 */
export function getPublicEnvSnapshot(): Record<RequiredEnvKey, string | undefined> {
  return {
    NEXT_PUBLIC_NETWORK: process.env.NEXT_PUBLIC_NETWORK,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL
  };
}

export function getMissingEnvKeys(): RequiredEnvKey[] {
  const snap = getPublicEnvSnapshot();
  const empty = REQUIRED_ENV_KEYS.filter((key) => {
    const v = snap[key];
    return typeof v !== "string" || v.trim() === "";
  });
  if (empty.length > 0) {
    return empty;
  }
  const net = snap.NEXT_PUBLIC_NETWORK?.trim().toLowerCase();
  if (!net || !VALID_NETWORKS.has(net)) {
    return ["NEXT_PUBLIC_NETWORK"];
  }
  return [];
}

export function isEnvConfigured(): boolean {
  return getMissingEnvKeys().length === 0;
}
