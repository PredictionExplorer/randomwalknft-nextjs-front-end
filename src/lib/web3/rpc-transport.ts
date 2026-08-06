import { fallback, http } from "viem";

import { getRpcHttpUrls } from "@/lib/web3/evm-chain";

/**
 * viem transport over the configured JSON-RPC servers: ordered by the hourly rotation
 * (see `server-rotation.ts`), with viem's `fallback()` failing over to the next server
 * when a request errors. Plain `http()` when only one server is configured.
 */
export function getRpcTransport() {
  const urls = getRpcHttpUrls();
  if (urls.length === 1) {
    return http(urls[0]);
  }
  return fallback(urls.map((url) => http(url)));
}
