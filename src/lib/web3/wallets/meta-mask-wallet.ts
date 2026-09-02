import { createConnector, type CreateConnectorFn } from "wagmi";
import { metaMask } from "wagmi/connectors";

import { trackEvent } from "@/lib/analytics";
import { getErrorMessage } from "@/lib/web3/errors";
import { getMetaMaskParameters } from "@/lib/web3/wallets/meta-mask-parameters";
import {
  clearMetaMaskSessionMarker,
  hasMetaMaskSessionMarker,
  markMetaMaskSessionAuthorized
} from "@/lib/web3/wallets/meta-mask-session";

export const META_MASK_CONNECTOR_ID = "metaMaskSDK";

/**
 * MetaMask *mobile* connector (deep link on phones, QR pairing on desktops without
 * the extension), backed by `@metamask/connect-evm`.
 *
 * Two deliberate deviations from the stock connector:
 * - `rdns` is dropped so an installed extension is NOT claimed by this connector.
 *   wagmi then exposes the extension as a regular EIP-6963 injected connector and
 *   extension users connect over plain EIP-1193 without ever downloading the SDK.
 * - A local session marker gates `isAuthorized()`, so anonymous visitors never
 *   load the SDK just to probe for a session that cannot exist.
 */
/** Upper bound on SDK initialisation before reconnection moves on to other wallets. */
const PROVIDER_TIMEOUT_MS = 8_000;

export function metaMaskWallet(): CreateConnectorFn {
  return createConnector((config) => {
    const { rdns: _claimedRdns, ...connector } = metaMask(getMetaMaskParameters())(config);
    let connecting = false;

    return {
      ...connector,
      /**
       * wagmi's reconnect awaits every connector's provider in turn. Without a
       * session marker there is nothing to reconnect, so skip SDK initialisation
       * entirely; with one, never let a stalled SDK block the other connectors.
       */
      async getProvider(parameters) {
        if (!connecting && !hasMetaMaskSessionMarker()) {
          return undefined;
        }
        return Promise.race([
          connector.getProvider(parameters),
          new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), PROVIDER_TIMEOUT_MS))
        ]);
      },
      async connect(parameters) {
        connecting = true;
        try {
          const connection = await connector.connect(parameters);
          markMetaMaskSessionAuthorized();
          return connection;
        } catch (error) {
          trackEvent("wallet_connect_error", {
            connector: META_MASK_CONNECTOR_ID,
            message: getErrorMessage(error),
            recovery: false
          });
          throw error;
        } finally {
          connecting = false;
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
  });
}
