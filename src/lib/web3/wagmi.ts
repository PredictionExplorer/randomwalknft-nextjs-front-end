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
import { arbitrum } from "wagmi/chains";

import { getConfig } from "@/lib/config";

export const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim() ?? "";

const walletConnectEnabled = walletConnectProjectId.length > 0;

let wagmiConfigSingleton: Config | undefined;

export function getWagmiConfig(): Config {
  if (wagmiConfigSingleton) {
    return wagmiConfigSingleton;
  }
  const { SITE_DESCRIPTION, SITE_NAME, SITE_URL } = getConfig();
  wagmiConfigSingleton = createConfig({
    chains: [arbitrum],
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
      [arbitrum.id]: http()
    }
  });
  return wagmiConfigSingleton;
}
