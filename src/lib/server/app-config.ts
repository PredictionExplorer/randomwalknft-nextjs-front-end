import "server-only";

import { cache } from "react";

import { getBaseConfig, type AppConfig } from "@/lib/config";
import { fetchRwalkContractsFromApi } from "@/lib/rwalk-contracts";

export const getAppConfig = cache(async (): Promise<AppConfig> => {
  const base = getBaseConfig();
  const contracts = await fetchRwalkContractsFromApi();
  return { ...base, ...contracts };
});
