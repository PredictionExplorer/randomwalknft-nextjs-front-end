"use client";

import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { injectedWallet } from "@rainbow-me/rainbowkit/wallets";
import type { Config } from "wagmi";

import { getBaseConfig } from "@/lib/config";
import { createAppWagmiConfig } from "@/lib/web3/wagmi";
import { metaMaskSdkWallet } from "@/lib/web3/wallets/meta-mask-sdk-wallet";

let clientWagmiConfigSingleton: Config | undefined;

export function getWagmiConfig(): Config {
  if (clientWagmiConfigSingleton) {
    return clientWagmiConfigSingleton;
  }

  const { SITE_DESCRIPTION, SITE_NAME, SITE_URL } = getBaseConfig();
  clientWagmiConfigSingleton = createAppWagmiConfig(
    connectorsForWallets(
      [
        {
          groupName: "Wallets",
          wallets: [metaMaskSdkWallet, injectedWallet]
        }
      ],
      {
        appName: SITE_NAME,
        appDescription: SITE_DESCRIPTION,
        appUrl: SITE_URL,
        // RainbowKit 2 requires this field even when every configured wallet is
        // non-WalletConnect. Keep it empty and verify the invariant in tests.
        projectId: ""
      }
    )
  );

  return clientWagmiConfigSingleton;
}
