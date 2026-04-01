/**
 * Browser-only: `NEXT_PUBLIC_*` values are inlined when `next dev` / `next build` runs.
 *
 * **Important:** Next.js only replaces env vars when you use a static property name, e.g.
 * `process.env.NEXT_PUBLIC_NETWORK`. Dynamic access like `process.env[key]` is not analyzed,
 * so in the client bundle it always looks “unset”. Read each key explicitly below so this
 * debug output matches what actually shipped (shell exports or `.env.local` at server start).
 */

export function getBundledNextPublicEnv(): Record<string, string | undefined> {
  return {
    NEXT_PUBLIC_NETWORK: process.env.NEXT_PUBLIC_NETWORK,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL,
    NEXT_PUBLIC_NFT_ADDRESS: process.env.NEXT_PUBLIC_NFT_ADDRESS,
    NEXT_PUBLIC_MARKET_ADDRESS: process.env.NEXT_PUBLIC_MARKET_ADDRESS,
    NEXT_PUBLIC_BLOCK_EXPLORER_URL: process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL
  };
}

/** Dev-only, client-only: logs bundled public env to the browser console (not the terminal). */
export function logBundledNextPublicEnvOnce(): void {
  if (typeof window === "undefined") {
    return;
  }
  if (process.env.NODE_ENV !== "development") {
    return;
  }
  console.info("[RandomWalk] NEXT_PUBLIC_* bundled in this browser build:", getBundledNextPublicEnv());
}
