"use client";

import { useEffect } from "react";
import { useConnection, useWalletClient } from "wagmi";

import { getConfiguredEvmChain } from "@/lib/web3/evm-chain";
import { WALLET_RESUME_EVENT } from "@/lib/web3/wallet-events";

export function useWalletStatus() {
  const { address, chain, chainId, connector, isConnected, isConnecting, isReconnecting, status } = useConnection();
  const configuredChainId = getConfiguredEvmChain().id;
  // `chain` is undefined whenever the wallet sits on a network this app does not configure.
  const isWrongNetwork = isConnected && (chain === undefined || chainId !== configuredChainId);
  const isReady = isConnected && !isConnecting && !isReconnecting && !isWrongNetwork;
  const {
    data: walletClient,
    error: walletClientError,
    isFetching: isWalletClientFetching,
    refetch: refetchWalletClient
  } = useWalletClient({
    chainId: configuredChainId,
    query: {
      enabled: isReady
    }
  });

  useEffect(() => {
    if (!isReady) {
      return;
    }

    function refreshWalletClient() {
      void refetchWalletClient();
    }

    window.addEventListener(WALLET_RESUME_EVENT, refreshWalletClient);
    return () => {
      window.removeEventListener(WALLET_RESUME_EVENT, refreshWalletClient);
    };
  }, [isReady, refetchWalletClient]);

  return {
    address,
    chain,
    connector,
    isConnected,
    isConnecting,
    isReconnecting,
    status,
    isWrongNetwork,
    isReady,
    walletClient,
    walletClientError,
    isWalletClientFetching,
    canTransact: isReady && Boolean(walletClient),
    refetchWalletClient
  };
}
