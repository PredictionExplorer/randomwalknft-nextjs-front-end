import "server-only";

import { z } from "zod";

import { fetchRwalk } from "@/lib/api/client";
import { getCurrentNetworkName } from "@/lib/web3/evm-chain";

const apiResponseSchema = z.object({
  status: z.number(),
  randomwalk_addr: z.string()
});

export type RwalkContractAddresses = {
  NFT_ADDRESS: `0x${string}`;
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
 * RandomWalk NFT address loaded from the Go API, kept for the lifetime of this Node
 * process (one `next dev` / `next start` / serverless instance). The address is immutable
 * per network, so the first successful response is cached; failures are not.
 */
let rwalkContractsProcessCache: RwalkContractAddresses | null = null;

/** GET /api/randomwalk/contracts through the shared client (rotation failover + timeout). */
export async function fetchRwalkContractsFromApi(): Promise<RwalkContractAddresses> {
  if (rwalkContractsProcessCache) {
    return rwalkContractsProcessCache;
  }

  const isLocal = getCurrentNetworkName() === "local";
  const parsed = await fetchRwalk(
    "contracts",
    isLocal ? { cache: "no-store" } : { revalidate: 300 },
    apiResponseSchema
  );
  const NFT_ADDRESS = normalizeAndValidateEthAddress("randomwalk_addr", parsed.randomwalk_addr);

  rwalkContractsProcessCache = { NFT_ADDRESS };
  return rwalkContractsProcessCache;
}
