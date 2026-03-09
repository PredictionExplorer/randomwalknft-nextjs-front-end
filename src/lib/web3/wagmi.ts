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
import { arbitrum } from "wagmi/chains";

import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/config";

export const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim() ?? "";
export const walletConnectEnabled = walletConnectProjectId.length > 0;

const appInfo = {
  appName: SITE_NAME,
  appDescription: SITE_DESCRIPTION,
  appUrl: SITE_URL
};

const walletList = [
  {
    groupName: "Popular",
    wallets: [
      metaMaskWallet,
      coinbaseWallet,
      rabbyWallet,
      rainbowWallet,
      injectedWallet,
      safeWallet,
      walletConnectWallet
    ]
  }
];

export const wagmiConfig = createConfig({
  chains: [arbitrum],
  connectors: walletConnectEnabled
    ? connectorsForWallets(walletList, {
        ...appInfo,
        projectId: walletConnectProjectId
      })
    : [injected({ shimDisconnect: true })],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage
  }),
  transports: {
    [arbitrum.id]: http()
  }
});
