import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  baseConnect,
  baseDisconnect,
  baseIsAuthorized,
  baseSetup,
  metaMaskConnector,
  metaMaskFactory,
  trackEvent
} = vi.hoisted(() => {
  const baseConnect = vi.fn();
  const baseDisconnect = vi.fn();
  const baseIsAuthorized = vi.fn();
  const baseSetup = vi.fn();

  return {
    baseConnect,
    baseDisconnect,
    baseIsAuthorized,
    baseSetup,
    metaMaskConnector: vi.fn(() => ({
      id: "metaMaskSDK",
      name: "MetaMask",
      type: "metaMask",
      connect: baseConnect,
      disconnect: baseDisconnect,
      isAuthorized: baseIsAuthorized,
      setup: baseSetup
    })),
    metaMaskFactory: vi.fn(),
    trackEvent: vi.fn()
  };
});

vi.mock("@/lib/analytics", () => ({
  trackEvent
}));

vi.mock("wagmi", () => ({
  createConnector:
    (factory: (config: unknown) => unknown) =>
    (config: unknown) =>
      factory(config)
}));

vi.mock("wagmi/connectors", () => ({
  metaMask: metaMaskFactory
}));

import { metaMaskSdkWallet } from "@/lib/web3/wallets/meta-mask-sdk-wallet";

describe("metaMaskSdkWallet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    baseConnect.mockResolvedValue({
      accounts: ["0x0000000000000000000000000000000000000001"],
      chainId: 42161
    });
    baseDisconnect.mockResolvedValue(undefined);
    baseIsAuthorized.mockResolvedValue(true);
    metaMaskFactory.mockReturnValue(metaMaskConnector);
  });

  it("always creates the MetaMask SDK connector with mobile-safe metadata", () => {
    const wallet = metaMaskSdkWallet();
    const createConnector = wallet.createConnector({
      rkDetails: {
        id: "metaMask",
        name: "MetaMask"
      }
    } as never);
    const connector = createConnector({ chains: [{ id: 42161 }] } as never) as unknown as {
      id: string;
      rkDetails: { id: string };
    };

    expect(metaMaskFactory).toHaveBeenCalledWith({
      checkInstallationImmediately: false,
      dappMetadata: {
        name: "Test Site",
        url: "https://test.example.com",
        iconUrl: "https://test.example.com/images/metamask-fox.svg"
      },
      enableAnalytics: false,
      headless: true,
      useDeeplink: true
    });
    expect(metaMaskConnector).toHaveBeenCalledTimes(1);
    expect(connector.id).toBe("metaMaskSDK");
    expect(connector.rkDetails.id).toBe("metaMask");
  });

  it("returns SDK deep-link URIs unchanged", () => {
    const wallet = metaMaskSdkWallet();
    const uri = "metamask://connect?channelId=test";

    expect(wallet.mobile?.getUri?.(uri)).toBe(uri);
    expect(wallet.id).toBe("metaMask");
    expect(wallet.rdns).toBe("io.metamask");
  });

  it("does not initialize or probe the SDK until a session has been authorized", async () => {
    const wallet = metaMaskSdkWallet();
    const createConnector = wallet.createConnector({ rkDetails: {} } as never);
    const connector = createConnector({ chains: [{ id: 42161 }] } as never) as unknown as {
      connect(parameters?: object): Promise<unknown>;
      disconnect(): Promise<void>;
      isAuthorized(): Promise<boolean>;
      setup(): Promise<void>;
    };

    await connector.setup();
    expect(baseSetup).not.toHaveBeenCalled();
    expect(await connector.isAuthorized()).toBe(false);
    expect(baseIsAuthorized).not.toHaveBeenCalled();

    await connector.connect();
    expect(baseConnect).toHaveBeenCalledTimes(1);
    expect(await connector.isAuthorized()).toBe(true);
    expect(baseIsAuthorized).toHaveBeenCalledTimes(1);

    await connector.disconnect();
    expect(baseDisconnect).toHaveBeenCalledTimes(1);
    expect(await connector.isAuthorized()).toBe(false);
    expect(baseIsAuthorized).toHaveBeenCalledTimes(1);
  });

  it("records SDK connection failures without swallowing them", async () => {
    const connectionError = Object.assign(new Error("Request already pending"), {
      code: -32002
    });
    baseConnect.mockRejectedValue(connectionError);
    const wallet = metaMaskSdkWallet();
    const createConnector = wallet.createConnector({ rkDetails: {} } as never);
    const connector = createConnector({ chains: [{ id: 42161 }] } as never) as unknown as {
      connect(parameters?: object): Promise<unknown>;
    };

    await expect(connector.connect()).rejects.toBe(connectionError);
    expect(trackEvent).toHaveBeenCalledWith("wallet_connect_error", {
      connector: "metaMaskSDK",
      message:
        "A wallet request is already pending. Open MetaMask and complete or reject it before trying again.",
      recovery: false
    });
  });
});
