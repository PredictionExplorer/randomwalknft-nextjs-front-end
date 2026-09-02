import { createPublicClient, type Chain, type PublicClient } from "viem";

import { getConfiguredEvmChain } from "@/lib/web3/evm-chain";
import { getRpcTransport } from "@/lib/web3/rpc-transport";

let cachedClient: PublicClient | undefined;
let cachedChain: Chain | undefined;

/**
 * Server-side viem client. Rebuilt whenever the configured chain object changes
 * (the hourly RPC rotation produces a new chain with a re-ordered transport), so a
 * long-lived `next start` process keeps following the rotation instead of freezing
 * the transport it happened to create at import time.
 */
export function getPublicClient(): PublicClient {
  const chain = getConfiguredEvmChain();
  if (!cachedClient || cachedChain !== chain) {
    cachedChain = chain;
    cachedClient = createPublicClient({ chain, transport: getRpcTransport() });
  }
  return cachedClient;
}
