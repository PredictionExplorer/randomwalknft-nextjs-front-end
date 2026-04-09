import "server-only";

import { z } from "zod";

import {
  isFetchConnectionError,
  rethrowAsBackendUnavailableIfConnectionFailed
} from "@/lib/api/backend-errors";
import { getCurrentNetworkName } from "@/lib/web3/evm-chain";

const apiResponseSchema = z.object({
  status: z.number(),
  marketplace_addr: z.string(),
  randomwalk_addr: z.string()
});

export type RwalkContractAddresses = {
  NFT_ADDRESS: `0x${string}`;
  MARKET_ADDRESS: `0x${string}`;
};

const ETH_ADDR_RE = /^0x[a-fA-F0-9]{40}$/;

function normalizeAndValidateEthAddress(label: string, raw: string): `0x${string}` {
  const v = raw.trim();
  if (!v || !ETH_ADDR_RE.test(v)) {
    throw new Error(
      `RandomWalk contracts API returned invalid ${label}: expected non-empty 0x-prefixed 40-hex address`
    );
  }
  return v as `0x${string}`;
}

/**
 * RandomWalk + marketplace addresses loaded from the Go API, kept for the lifetime of this Node
 * process (one `next dev` / `next start` / serverless instance). First successful response is cached;
 * failures are not cached.
 */
let rwalkContractsProcessCache: RwalkContractAddresses | null = null;

/**
 * Fetches GET /api/randomwalk/contracts, validates non-empty addresses, caches in memory for the
 * process. Retries transient connection errors a few times.
 */
export async function fetchRwalkContractsFromApi(): Promise<RwalkContractAddresses> {
  if (rwalkContractsProcessCache) {
    return rwalkContractsProcessCache;
  }

  const api = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!api) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is required to load contract addresses from the API");
  }

  const url = `${api.replace(/\/+$/, "")}/api/randomwalk/contracts`; // must match BACKEND_RANDOMWALK_API_PREFIX in config
  const isLocal = getCurrentNetworkName() === "local";
  const init: RequestInit = isLocal
    ? { cache: "no-store" }
    : ({ next: { revalidate: 300 } } as RequestInit);

  let res: Response | undefined;
  const maxAttempts = 3;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      res = await fetch(url, init);
      break;
    } catch (e) {
      const last = attempt === maxAttempts - 1;
      if (last || !isFetchConnectionError(e)) {
        rethrowAsBackendUnavailableIfConnectionFailed(e);
      }
      await new Promise((r) => setTimeout(r, 150 * (attempt + 1)));
    }
  }
  if (!res) {
    throw new Error("Failed to fetch contract addresses");
  }
  if (!res.ok) {
    throw new Error(`Failed to load /api/randomwalk/contracts: ${res.status} ${res.statusText}`);
  }

  const json: unknown = await res.json();
  const parsed = apiResponseSchema.parse(json);
  const NFT_ADDRESS = normalizeAndValidateEthAddress("randomwalk_addr", parsed.randomwalk_addr);
  const MARKET_ADDRESS = normalizeAndValidateEthAddress("marketplace_addr", parsed.marketplace_addr);

  rwalkContractsProcessCache = { NFT_ADDRESS, MARKET_ADDRESS };
  return rwalkContractsProcessCache;
}
