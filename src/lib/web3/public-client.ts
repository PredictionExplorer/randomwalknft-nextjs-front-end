import { createPublicClient } from "viem";

import { getConfiguredEvmChain } from "@/lib/web3/evm-chain";
import { getRpcTransport } from "@/lib/web3/rpc-transport";

const chain = getConfiguredEvmChain();

export const publicClient = createPublicClient({
  chain,
  transport: getRpcTransport()
});
