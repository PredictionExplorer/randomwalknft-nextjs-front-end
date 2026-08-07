import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { WALLET_RESUME_EVENT } from "@/lib/web3/wallet-events";

const refetchWalletClient = vi.fn();
const accountState: {
  address?: `0x${string}`;
  chain?: { id: number; unsupported?: boolean };
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  status: "connected" | "connecting" | "reconnecting" | "disconnected";
} = {
  isConnected: false,
  isConnecting: false,
  isReconnecting: false,
  status: "disconnected"
};
let walletClient: object | undefined;
let walletClientFetching = false;

vi.mock("wagmi", () => ({
  useAccount: () => accountState,
  useWalletClient: () => ({
    data: walletClient,
    error: null,
    isFetching: walletClientFetching,
    refetch: refetchWalletClient
  })
}));

import { useWalletStatus } from "@/lib/web3/use-wallet-status";

describe("useWalletStatus", () => {
  beforeEach(() => {
    Object.assign(accountState, {
      address: undefined,
      chain: undefined,
      isConnected: false,
      isConnecting: false,
      isReconnecting: false,
      status: "disconnected"
    });
    walletClient = undefined;
    walletClientFetching = false;
    refetchWalletClient.mockReset();
    refetchWalletClient.mockResolvedValue({ data: walletClient });
  });

  it("keeps disconnected and reconnecting wallets transaction-locked", () => {
    const { result, rerender } = renderHook(() => useWalletStatus());
    expect(result.current.canTransact).toBe(false);

    Object.assign(accountState, {
      address: "0x0000000000000000000000000000000000000001",
      chain: { id: 42161 },
      isConnected: true,
      isReconnecting: true,
      status: "reconnecting"
    });
    rerender();

    expect(result.current.isReady).toBe(false);
    expect(result.current.canTransact).toBe(false);
  });

  it("rejects the wrong chain even when an account is connected", () => {
    Object.assign(accountState, {
      address: "0x0000000000000000000000000000000000000001",
      chain: { id: 1 },
      isConnected: true,
      status: "connected"
    });

    const { result } = renderHook(() => useWalletStatus());

    expect(result.current.isWrongNetwork).toBe(true);
    expect(result.current.isReady).toBe(false);
    expect(result.current.canTransact).toBe(false);
  });

  it("treats an explicitly unsupported configured chain as wrong", () => {
    Object.assign(accountState, {
      address: "0x0000000000000000000000000000000000000001",
      chain: { id: 42161, unsupported: true },
      isConnected: true,
      status: "connected"
    });

    const { result } = renderHook(() => useWalletStatus());

    expect(result.current.isWrongNetwork).toBe(true);
    expect(result.current.isReady).toBe(false);
  });

  it("requires both the configured chain and a wallet client", () => {
    Object.assign(accountState, {
      address: "0x0000000000000000000000000000000000000001",
      chain: { id: 42161 },
      isConnected: true,
      status: "connected"
    });
    const { result, rerender } = renderHook(() => useWalletStatus());

    expect(result.current.isReady).toBe(true);
    expect(result.current.canTransact).toBe(false);

    walletClient = { account: accountState.address };
    rerender();
    expect(result.current.canTransact).toBe(true);
  });

  it("refreshes the wallet client after a mobile app resume", () => {
    Object.assign(accountState, {
      address: "0x0000000000000000000000000000000000000001",
      chain: { id: 42161 },
      isConnected: true,
      status: "connected"
    });
    walletClient = { account: accountState.address };
    renderHook(() => useWalletStatus());

    act(() => {
      window.dispatchEvent(new Event(WALLET_RESUME_EVENT));
    });

    expect(refetchWalletClient).toHaveBeenCalledTimes(1);
  });
});
