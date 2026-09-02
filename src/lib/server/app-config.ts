import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { getBaseConfig, type AppConfig } from "@/lib/config";
import { fetchRwalkContractsFromApi } from "@/lib/rwalk-contracts";

/**
 * Static site config plus the contract addresses the API publishes. Addresses are
 * immutable per network, so they are cached for hours; `revalidateTag("contracts")`
 * forces a refresh if the API ever moves.
 */
export async function getAppConfig(): Promise<AppConfig> {
  "use cache";
  cacheLife("hours");
  cacheTag("contracts");
  const base = getBaseConfig();
  const contracts = await fetchRwalkContractsFromApi();
  return { ...base, ...contracts };
}
