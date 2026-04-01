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
  http,
  injected
} from "wagmi";
import type { Config } from "wagmi";

import { getBaseConfig } from "@/lib/config";
import { getConfiguredEvmChain, getRpcHttpUrl } from "@/lib/web3/evm-chain";

export const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim() ?? "";

const walletConnectEnabled = walletConnectProjectId.length > 0;

let wagmiConfigSingleton: Config | undefined;

export function getWagmiConfig(): Config {
  if (wagmiConfigSingleton) {
    return wagmiConfigSingleton;
  }
  const chain = getConfiguredEvmChain();
  const { SITE_DESCRIPTION, SITE_NAME, SITE_URL } = getBaseConfig();
  // SITE_URL is WalletConnect / dapp metadata only (e.g. http://localhost:3000). It is NOT the chain
  // JSON-RPC URL — that comes from getRpcHttpUrl() on `chain.rpcUrls` and `transports` below.
  wagmiConfigSingleton = createConfig({
    chains: [chain],
    connectors: walletConnectEnabled
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
      [chain.id]: http(getRpcHttpUrl())
    }
  });
  return wagmiConfigSingleton;
}
