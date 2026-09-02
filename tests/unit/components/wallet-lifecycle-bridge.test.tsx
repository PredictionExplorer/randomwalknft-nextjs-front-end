import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { WALLET_RESUME_EVENT } from "@/lib/web3/wallet-events";

const { connectionState, metaMaskConnector, reconnectMutateAsync, trackEvent } = vi.hoisted(() => ({
  reconnectMutateAsync: vi.fn(),
  trackEvent: vi.fn(),
  connectionState: {
    isConnected: false,
    isConnecting: false,
    isReconnecting: false
  },
  metaMaskConnector: { id: "metaMaskSDK" }
}));

vi.mock("wagmi", () => ({
  useConnection: () => connectionState,
  useConnectionEffect: vi.fn(),
  useConnectors: () => [metaMaskConnector],
  useReconnect: () => ({ mutateAsync: reconnectMutateAsync })
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent
}));

import { WalletLifecycleBridge } from "@/components/wallet/wallet-lifecycle-bridge";

function setVisibility(value: DocumentVisibilityState) {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    value
  });
}

describe("WalletLifecycleBridge", () => {
  beforeEach(() => {
    Object.assign(connectionState, {
      isConnected: false,
      isConnecting: false,
      isReconnecting: false
    });
    reconnectMutateAsync.mockReset();
    reconnectMutateAsync.mockResolvedValue([{ accounts: ["0x1"] }]);
    trackEvent.mockReset();
    setVisibility("visible");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("runs one silent MetaMask reconnect after returning from the background", async () => {
    vi.useFakeTimers();
    render(<WalletLifecycleBridge />);

    setVisibility("hidden");
    document.dispatchEvent(new Event("visibilitychange"));
    expect(reconnectMutateAsync).not.toHaveBeenCalled();

    setVisibility("visible");
    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
      await Promise.resolve();
    });

    expect(reconnectMutateAsync).toHaveBeenCalledWith({
      connectors: [metaMaskConnector]
    });
    expect(trackEvent).toHaveBeenCalledWith("wallet_session_recovered", {
      connector: "metaMaskSDK"
    });

    setVisibility("hidden");
    document.dispatchEvent(new Event("visibilitychange"));
    setVisibility("visible");
    document.dispatchEvent(new Event("visibilitychange"));
    expect(reconnectMutateAsync).toHaveBeenCalledTimes(1);
  });

  it("refreshes subscribers but does not reconnect an already connected wallet", async () => {
    connectionState.isConnected = true;
    const onResume = vi.fn();
    window.addEventListener(WALLET_RESUME_EVENT, onResume);
    render(<WalletLifecycleBridge />);

    setVisibility("hidden");
    document.dispatchEvent(new Event("visibilitychange"));
    setVisibility("visible");
    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
      await Promise.resolve();
    });

    expect(onResume).toHaveBeenCalledTimes(1);
    expect(reconnectMutateAsync).not.toHaveBeenCalled();
    window.removeEventListener(WALLET_RESUME_EVENT, onResume);
  });

  it("records a recovery failure without throwing", async () => {
    reconnectMutateAsync.mockRejectedValueOnce(new Error("relay unavailable"));
    render(<WalletLifecycleBridge />);

    setVisibility("hidden");
    document.dispatchEvent(new Event("visibilitychange"));
    setVisibility("visible");
    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
      await Promise.resolve();
    });

    expect(trackEvent).toHaveBeenCalledWith(
      "wallet_connect_error",
      expect.objectContaining({ connector: "metaMaskSDK", recovery: true })
    );
  });
});
