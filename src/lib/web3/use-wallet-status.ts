"use client";

import { useAccount } from "wagmi";

import { getConfiguredEvmChain } from "@/lib/web3/evm-chain";

export function useWalletStatus() {
  const { address, chain, isConnected } = useAccount();
  const configuredChainId = getConfiguredEvmChain().id;

  return {
    address,
    chain,
    isConnected,
    isWrongNetwork: Boolean(isConnected && chain?.id !== configuredChainId),
    isReady: isConnected && chain?.id === configuredChainId
  };
}
