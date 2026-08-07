import type { Wallet } from "@rainbow-me/rainbowkit";
import { createConnector } from "wagmi";
import { metaMask } from "wagmi/connectors";

import { trackEvent } from "@/lib/analytics";
import { getBaseConfig } from "@/lib/config";
import { getErrorMessage } from "@/lib/web3/errors";
import { getMetaMaskParameters } from "@/lib/web3/wallets/meta-mask-parameters";
import {
  clearMetaMaskSessionMarker,
  hasMetaMaskSessionMarker,
  markMetaMaskSessionAuthorized
} from "@/lib/web3/wallets/meta-mask-session";

/**
 * RainbowKit's stock MetaMask wallet falls back to WalletConnect on desktop when
 * the extension is not installed. This app intentionally does not use
 * WalletConnect, so keep the MetaMask SDK connector behind an app-owned wallet
 * definition instead.
 */
export function metaMaskSdkWallet(): Wallet {
  const { SITE_URL } = getBaseConfig();

  return {
    id: "metaMask",
    name: "MetaMask",
    rdns: "io.metamask",
    iconUrl: `${SITE_URL}/images/metamask-fox.svg`,
    iconAccent: "#f6851b",
    iconBackground: "#ffffff",
    downloadUrls: {
      android: "https://play.google.com/store/apps/details?id=io.metamask",
      ios: "https://apps.apple.com/app/metamask/id1438144202",
      mobile: "https://metamask.io/download/",
      browserExtension: "https://metamask.io/download/"
    },
    mobile: {
      // The SDK already produces the correct MetaMask mobile deep link.
      getUri: (uri) => uri
    },
    extension: {
      instructions: {
        learnMoreUrl: "https://metamask.io/download/",
        steps: [
          {
            step: "install",
            title: "Install MetaMask",
            description: "Install the MetaMask browser extension, then refresh this page."
          },
          {
            step: "create",
            title: "Create or import a wallet",
            description: "Create a new MetaMask wallet or import an existing one."
          },
          {
            step: "refresh",
            title: "Refresh the page",
            description: "Refresh this page and select MetaMask again."
          }
        ]
      }
    },
    createConnector: (walletDetails) =>
      createConnector((config) => {
        const connector = metaMask(getMetaMaskParameters())(config);

        return {
          ...connector,
          ...walletDetails,
          // The legacy connector initializes the full SDK from setup() and
          // isAuthorized(). Avoid loading its relay on every anonymous page.
          setup: () => Promise.resolve(),
          async connect(parameters) {
            try {
              const connection = await connector.connect(parameters);
              markMetaMaskSessionAuthorized();
              return connection;
            } catch (error) {
              trackEvent("wallet_connect_error", {
                connector: "metaMaskSDK",
                message: getErrorMessage(error),
                recovery: false
              });
              throw error;
            }
          },
          async disconnect() {
            try {
              await connector.disconnect();
            } finally {
              clearMetaMaskSessionMarker();
            }
          },
          async isAuthorized() {
            if (!hasMetaMaskSessionMarker()) {
              return false;
            }

            try {
              const authorized = await connector.isAuthorized();
              if (!authorized) {
                clearMetaMaskSessionMarker();
              }
              return authorized;
            } catch {
              clearMetaMaskSessionMarker();
              return false;
            }
          }
        };
      })
  };
}
