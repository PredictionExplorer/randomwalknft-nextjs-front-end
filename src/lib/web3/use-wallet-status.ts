"use client";

import { useEffect } from "react";
import { useConnection, useWalletClient } from "wagmi";

import { useMounted } from "@/lib/use-mounted";
import { getConfiguredEvmChain } from "@/lib/web3/evm-chain";
import { WALLET_RESUME_EVENT } from "@/lib/web3/wallet-events";

/**
 * Wallet state for UI. Until the component has hydrated it reports "disconnected",
 * matching the server HTML: wagmi starts reconnecting the moment the root mounts,
 * and streamed islands that hydrate later would otherwise see a different status
 * than the one they were rendered with.
 */
export function useWalletStatus() {
  const mounted = useMounted();
  const connection = useConnection();
  const configuredChainId = getConfiguredEvmChain().id;

  const address = mounted ? connection.address : undefined;
  const chain = mounted ? connection.chain : undefined;
  const chainId = mounted ? connection.chainId : undefined;
  const connector = mounted ? connection.connector : undefined;
  const isConnected = mounted && connection.isConnected;
  const isConnecting = mounted && connection.isConnecting;
  const isReconnecting = mounted && connection.isReconnecting;
  const status = mounted ? connection.status : "disconnected";

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
    chainId,
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
