import "server-only";

import { cache } from "react";
import { z } from "zod";

import { rethrowAsBackendUnavailableIfConnectionFailed } from "@/lib/api/backend-errors";
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

/**
 * Loads RandomWalk + marketplace addresses from GET /api/randomwalk/contracts (rw_contracts in DB).
 * If NEXT_PUBLIC_NFT_ADDRESS and NEXT_PUBLIC_MARKET_ADDRESS are both set, uses those **except on
 * `NEXT_PUBLIC_NETWORK=local`**, where the API is always used so Hardhat addresses come from the DB.
 */
export const fetchRwalkContractsFromApi = cache(async (): Promise<RwalkContractAddresses> => {
  const envNft = process.env.NEXT_PUBLIC_NFT_ADDRESS?.trim();
  const envMarket = process.env.NEXT_PUBLIC_MARKET_ADDRESS?.trim();
  if (getCurrentNetworkName() !== "local" && envNft && envMarket) {
    return {
      NFT_ADDRESS: envNft as `0x${string}`,
      MARKET_ADDRESS: envMarket as `0x${string}`
    };
  }

  const api = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!api) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is required to load contract addresses from the API");
  }

  const url = `${api.replace(/\/+$/, "")}/api/randomwalk/contracts`; // must match BACKEND_RANDOMWALK_API_PREFIX in config
  const isLocal = getCurrentNetworkName() === "local";
  let res: Response;
  try {
    // Local dev: never use Next’s Data Cache — stale responses look like “wrong” contracts after DB/ETL changes.
    res = await fetch(
      url,
      isLocal ? { cache: "no-store" } : { next: { revalidate: 300 } }
    );
  } catch (e) {
    rethrowAsBackendUnavailableIfConnectionFailed(e);
  }
  if (!res.ok) {
    throw new Error(`Failed to load /api/randomwalk/contracts: ${res.status} ${res.statusText}`);
  }

  const json: unknown = await res.json();
  const parsed = apiResponseSchema.parse(json);
  return {
    NFT_ADDRESS: parsed.randomwalk_addr as `0x${string}`,
    MARKET_ADDRESS: parsed.marketplace_addr as `0x${string}`
  };
});
