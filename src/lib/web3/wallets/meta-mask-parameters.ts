import type { MetaMaskParameters } from "wagmi/connectors";

import { getBaseConfig } from "@/lib/config";

export function getMetaMaskParameters(): MetaMaskParameters {
  const { SITE_NAME, SITE_URL } = getBaseConfig();

  return {
    checkInstallationImmediately: false,
    dappMetadata: {
      name: SITE_NAME,
      url: SITE_URL,
      iconUrl: `${SITE_URL}/images/metamask-fox.svg`
    },
    enableAnalytics: false,
    headless: true,
    useDeeplink: true
  };
}
