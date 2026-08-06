import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  rabbyWallet,
  rainbowWallet,
  safeWallet,
  walletConnectWallet
} from "@rainbow-me/rainbowkit/wallets";
import {
  cookieStorage,
  createConfig,
  createStorage,
  injected
} from "wagmi";
import type { Config } from "wagmi";

import { getBaseConfig } from "@/lib/config";
import { getConfiguredEvmChain } from "@/lib/web3/evm-chain";
import { getRpcTransport } from "@/lib/web3/rpc-transport";

export const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim() ?? "";

const walletConnectEnabled = walletConnectProjectId.length > 0;

/**
 * RainbowKit's `connectorsForWallets` is client-only ("use client"): calling it during server
 * rendering throws. `RootLayoutShell` (a server component) needs the config only for
 * `cookieToInitialState`, which reads chains/storage and never touches connectors — so the
 * server config uses the plain injected connector, and the browser config (a separate module
 * instance) gets the full RainbowKit wallet list.
 */
const useRainbowKitConnectors = walletConnectEnabled && typeof window !== "undefined";

let wagmiConfigSingleton: Config | undefined;

export function getWagmiConfig(): Config {
  if (wagmiConfigSingleton) {
    return wagmiConfigSingleton;
  }
  const chain = getConfiguredEvmChain();
  const { SITE_DESCRIPTION, SITE_NAME, SITE_URL } = getBaseConfig();
  // SITE_URL is WalletConnect / dapp metadata only (e.g. http://localhost:3000). It is NOT the chain
  // JSON-RPC URL — that comes from getRpcTransport() on `transports` below (rotation + failover).
  wagmiConfigSingleton = createConfig({
    chains: [chain],
    connectors: useRainbowKitConnectors
      ? connectorsForWallets(
          [
            {
              groupName: "Popular",
              wallets: [
                metaMaskWallet,
                coinbaseWallet,
                rabbyWallet,
                rainbowWallet,
                safeWallet,
                walletConnectWallet,
                injectedWallet
              ]
            }
          ],
          {
            appName: SITE_NAME,
            appDescription: SITE_DESCRIPTION,
            appUrl: SITE_URL,
            projectId: walletConnectProjectId
          }
        )
      : [injected({ shimDisconnect: true })],
    ssr: true,
    storage: createStorage({ storage: cookieStorage }),
    transports: {
      [chain.id]: getRpcTransport()
    }
  });
  return wagmiConfigSingleton;
}
