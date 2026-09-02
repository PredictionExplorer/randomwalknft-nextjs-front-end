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
 * GET /api/randomwalk/contracts through the shared client (rotation failover + timeout).
 * Callers cache the result (see `getAppConfig`); this stays a plain fetch so failures
 * are never retained.
 */
export async function fetchRwalkContractsFromApi(): Promise<RwalkContractAddresses> {
  const isLocal = getCurrentNetworkName() === "local";
  const parsed = await fetchRwalk(
    "contracts",
    isLocal ? { cache: "no-store" } : { revalidate: 300 },
    apiResponseSchema
  );
  return { NFT_ADDRESS: normalizeAndValidateEthAddress("randomwalk_addr", parsed.randomwalk_addr) };
}
