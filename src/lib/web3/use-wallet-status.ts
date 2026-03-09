"use client";

import { useAccount } from "wagmi";
import { arbitrum } from "wagmi/chains";

export function useWalletStatus() {
  const { address, chain, isConnected } = useAccount();

  return {
    address,
    chain,
    isConnected,
    isWrongNetwork: Boolean(isConnected && chain?.id !== arbitrum.id),
    isReady: isConnected && chain?.id === arbitrum.id
  };
}
