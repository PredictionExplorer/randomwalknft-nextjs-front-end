import type { MetaMaskParameters } from "wagmi/connectors";

import { getBaseConfig } from "@/lib/config";

/**
 * Options for wagmi's `metaMask` connector (backed by `@metamask/connect-evm`).
 * Headless: the site renders its own connect modal, including the QR code for
 * desktop visitors without the extension, instead of MetaMask's stock overlay.
 */
export function getMetaMaskParameters(): MetaMaskParameters {
  const { SITE_NAME, SITE_URL } = getBaseConfig();

  return {
    dapp: {
      name: SITE_NAME,
      url: SITE_URL,
      iconUrl: `${SITE_URL}/images/metamask-fox.svg`
    },
    ui: {
      headless: true,
      preferExtension: true
    },
    mobile: {
      useDeeplink: true
    }
  };
}
