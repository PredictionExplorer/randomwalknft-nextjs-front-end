"use client";

import { useCallback, useEffect, useRef } from "react";
import { useAccount, useAccountEffect, useReconnect } from "wagmi";

import { trackEvent } from "@/lib/analytics";
import { getErrorMessage } from "@/lib/web3/errors";
import { WALLET_RESUME_EVENT } from "@/lib/web3/wallet-events";
import { markMetaMaskSessionAuthorized } from "@/lib/web3/wallets/meta-mask-session";

const RECOVERY_COOLDOWN_MS = 2_000;

/**
 * Mobile wallet approvals temporarily background the browser. Wagmi reconnects
 * on mount, but an already-mounted page also needs a conservative recovery
 * pass when it becomes visible again.
 */
export function WalletLifecycleBridge() {
  const { isConnected, isConnecting, isReconnecting } = useAccount();
  const { connectors, reconnectAsync } = useReconnect();
  const recoveryInFlight = useRef(false);
  const hiddenSinceLastRecovery = useRef(false);
  const lastRecoveryAt = useRef(0);

  useAccountEffect({
    onConnect({ chainId, connector, isReconnected }) {
      if (connector.id === "metaMaskSDK") {
        markMetaMaskSessionAuthorized();
      }
      trackEvent("wallet_connect_success", {
        chainId,
        connector: connector.id,
        reconnected: isReconnected
      });
    }
  });

  const recover = useCallback(async () => {
    window.dispatchEvent(new Event(WALLET_RESUME_EVENT));

    if (
      recoveryInFlight.current ||
      isConnected ||
      isConnecting ||
      isReconnecting ||
      Date.now() - lastRecoveryAt.current < RECOVERY_COOLDOWN_MS
    ) {
      return;
    }

    const metaMaskConnector = connectors.find((connector) => connector.id === "metaMaskSDK");
    if (!metaMaskConnector) {
      return;
    }

    recoveryInFlight.current = true;
    lastRecoveryAt.current = Date.now();
    try {
      const connections = await reconnectAsync({ connectors: [metaMaskConnector] });
      if (connections.length > 0) {
        trackEvent("wallet_session_recovered", {
          connector: metaMaskConnector.id
        });
      }
    } catch (error) {
      trackEvent("wallet_connect_error", {
        connector: metaMaskConnector.id,
        message: getErrorMessage(error),
        recovery: true
      });
    } finally {
      recoveryInFlight.current = false;
    }
  }, [connectors, isConnected, isConnecting, isReconnecting, reconnectAsync]);

  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === "hidden") {
        hiddenSinceLastRecovery.current = true;
        return;
      }

      if (hiddenSinceLastRecovery.current) {
        hiddenSinceLastRecovery.current = false;
        void recover();
      }
    }

    function onPageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        void recover();
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [recover]);

  return null;
}
