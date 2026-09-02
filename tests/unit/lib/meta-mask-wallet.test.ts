import { beforeEach, describe, expect, it, vi } from "vitest";

const { baseConnector, trackEvent } = vi.hoisted(() => ({
  trackEvent: vi.fn(),
  baseConnector: {
    id: "metaMaskSDK",
    name: "MetaMask",
    type: "metaMask",
    rdns: ["io.metamask", "io.metamask.mobile"],
    connect: vi.fn(),
    disconnect: vi.fn(),
    isAuthorized: vi.fn(),
    getAccounts: vi.fn(),
    getChainId: vi.fn(),
    getProvider: vi.fn(),
    onAccountsChanged: vi.fn(),
    onChainChanged: vi.fn(),
    onDisconnect: vi.fn()
  }
}));

vi.mock("wagmi", () => ({
  createConnector: (factory: (config: unknown) => unknown) => factory
}));

vi.mock("wagmi/connectors", () => ({
  metaMask: () => () => baseConnector
}));

vi.mock("@/lib/analytics", () => ({ trackEvent }));

import { metaMaskWallet } from "@/lib/web3/wallets/meta-mask-wallet";
import {
  clearMetaMaskSessionMarker,
  hasMetaMaskSessionMarker,
  markMetaMaskSessionAuthorized
} from "@/lib/web3/wallets/meta-mask-session";

type Wrapped = {
  rdns?: unknown;
  connect: (parameters?: unknown) => Promise<unknown>;
  disconnect: () => Promise<void>;
  isAuthorized: () => Promise<boolean>;
};

function createWrapped(): Wrapped {
  const factory = metaMaskWallet() as unknown as (config: unknown) => Wrapped;
  return factory({});
}

describe("metaMaskWallet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearMetaMaskSessionMarker();
    baseConnector.connect.mockResolvedValue({ accounts: ["0x1"], chainId: 42161 });
    baseConnector.disconnect.mockResolvedValue(undefined);
    baseConnector.isAuthorized.mockResolvedValue(true);
  });

  it("does not claim the extension's EIP-6963 rdns so wagmi exposes it as an injected wallet", () => {
    expect(createWrapped().rdns).toBeUndefined();
  });

  it("marks the session after a successful connect and clears it on disconnect", async () => {
    const wrapped = createWrapped();

    await wrapped.connect({ chainId: 42161 });
    expect(baseConnector.connect).toHaveBeenCalledWith({ chainId: 42161 });
    expect(hasMetaMaskSessionMarker()).toBe(true);

    await wrapped.disconnect();
    expect(hasMetaMaskSessionMarker()).toBe(false);
  });

  it("reports connect failures to analytics and rethrows", async () => {
    baseConnector.connect.mockRejectedValue(new Error("User rejected the request"));

    await expect(createWrapped().connect()).rejects.toThrow(/rejected/);
    expect(trackEvent).toHaveBeenCalledWith(
      "wallet_connect_error",
      expect.objectContaining({ connector: "metaMaskSDK", recovery: false })
    );
    expect(hasMetaMaskSessionMarker()).toBe(false);
  });

  it("skips the SDK authorization probe entirely without a session marker", async () => {
    await expect(createWrapped().isAuthorized()).resolves.toBe(false);
    expect(baseConnector.isAuthorized).not.toHaveBeenCalled();
  });

  it("probes the SDK when a marker exists and clears the marker if the session is gone", async () => {
    markMetaMaskSessionAuthorized();
    baseConnector.isAuthorized.mockResolvedValueOnce(true);
    await expect(createWrapped().isAuthorized()).resolves.toBe(true);
    expect(hasMetaMaskSessionMarker()).toBe(true);

    baseConnector.isAuthorized.mockResolvedValueOnce(false);
    await expect(createWrapped().isAuthorized()).resolves.toBe(false);
    expect(hasMetaMaskSessionMarker()).toBe(false);
  });

  it("treats a throwing probe as unauthorized", async () => {
    markMetaMaskSessionAuthorized();
    baseConnector.isAuthorized.mockRejectedValueOnce(new Error("relay timeout"));

    await expect(createWrapped().isAuthorized()).resolves.toBe(false);
    expect(hasMetaMaskSessionMarker()).toBe(false);
  });
});
