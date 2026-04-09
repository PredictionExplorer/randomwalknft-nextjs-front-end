import { createPublicClient, http } from "viem";

import { getConfiguredEvmChain, getRpcHttpUrl } from "@/lib/web3/evm-chain";

const chain = getConfiguredEvmChain();

export const publicClient = createPublicClient({
  chain,
  transport: http(getRpcHttpUrl())
});
