import type { Connector } from "wagmi";

import { META_MASK_CONNECTOR_ID } from "@/lib/web3/wallets/meta-mask-wallet";

const INJECTED_CONNECTOR_ID = "injected";

export type WalletOption = {
  connector: Connector;
  /** Stable id for keys and analytics. */
  id: string;
  label: string;
  description: string;
  /** Image URL (EIP-6963 wallets announce their own icon). */
  iconUrl: string | undefined;
};

const METAMASK_RDNS = new Set(["io.metamask", "io.metamask.mobile", "io.metamask.flask"]);
const METAMASK_ICON = "/images/metamask-fox.svg";

function connectorRdns(connector: Connector): readonly string[] {
  const { rdns } = connector;
  if (!rdns) return [];
  return typeof rdns === "string" ? [rdns] : rdns;
}

/** EIP-6963 connectors created by wagmi carry the announced rdns as their `id`. */
function isMetaMaskRdns(connector: Connector): boolean {
  return METAMASK_RDNS.has(connector.id) || connectorRdns(connector).some((rdns) => METAMASK_RDNS.has(rdns));
}

/**
 * Turns wagmi's connector list into what the connect modal shows.
 *
 * - "MetaMask" is a single entry: the extension when the browser announces one
 *   (plain EIP-1193, no SDK download), otherwise the mobile SDK connector.
 * - Every other EIP-6963 wallet appears under its announced name and icon.
 * - The generic browser provider is offered only for legacy single-provider
 *   browsers (no EIP-6963 announcements) that still inject `window.ethereum`.
 * - WalletConnect never appears.
 */
export function buildWalletOptions(connectors: readonly Connector[], hasWindowProvider: boolean): WalletOption[] {
  const announced = connectors.filter(
    (connector) => connector.type === "injected" && connector.id !== INJECTED_CONNECTOR_ID
  );
  const extension = announced.find(isMetaMaskRdns);
  const sdk = connectors.find((connector) => connector.id === META_MASK_CONNECTOR_ID);
  const generic = connectors.find((connector) => connector.id === INJECTED_CONNECTOR_ID);

  const options: WalletOption[] = [];
  if (extension) {
    options.push({
      connector: extension,
      id: extension.id,
      label: "MetaMask",
      description: "Browser extension detected",
      iconUrl: extension.icon ?? METAMASK_ICON
    });
  } else if (sdk) {
    options.push({
      connector: sdk,
      id: sdk.id,
      label: "MetaMask",
      description: "MetaMask mobile app — open or scan",
      iconUrl: METAMASK_ICON
    });
  }
  for (const connector of announced) {
    if (connector === extension) continue;
    options.push({
      connector,
      id: connector.id,
      label: connector.name,
      description: "Detected in this browser",
      iconUrl: connector.icon
    });
  }
  if (generic && hasWindowProvider && announced.length === 0) {
    options.push({
      connector: generic,
      id: generic.id,
      label: "Browser Wallet",
      description: "The wallet injected into this page",
      iconUrl: undefined
    });
  }
  return options;
}

/** MetaMask's universal link that opens the current page inside the in-app browser. */
export function metaMaskDappLink(location: { host: string; pathname: string }): string {
  return `https://metamask.app.link/dapp/${location.host}${location.pathname}`;
}

export function isMobileUserAgent(navigatorLike: {
  userAgent: string;
  platform?: string;
  maxTouchPoints?: number;
}): boolean {
  return (
    /Android|iPhone|iPad|iPod/i.test(navigatorLike.userAgent) ||
    (navigatorLike.platform === "MacIntel" && (navigatorLike.maxTouchPoints ?? 0) > 1)
  );
}
