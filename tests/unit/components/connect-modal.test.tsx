import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type Listener = (message: { type: string; data?: unknown }) => void;

const { connectMutateAsync, connectors, emitterListeners } = vi.hoisted(() => {
  const emitterListeners = new Set<Listener>();
  const emitter = {
    on: (_event: string, listener: Listener) => emitterListeners.add(listener),
    off: (_event: string, listener: Listener) => emitterListeners.delete(listener)
  };
  return {
    connectMutateAsync: vi.fn(),
    emitterListeners,
    connectors: [
      { id: "metaMaskSDK", name: "MetaMask", type: "metaMask", emitter },
      { id: "injected", name: "Injected", type: "injected", emitter }
    ]
  };
});

vi.mock("wagmi", () => ({
  useConnectors: () => connectors,
  useConnect: () => ({ mutateAsync: connectMutateAsync })
}));

import { ConnectModal } from "@/components/wallet/connect-modal";

function renderModal(onConnected = vi.fn(), onOpenChange = vi.fn()) {
  render(<ConnectModal open onOpenChange={onOpenChange} onConnected={onConnected} />);
  return { onConnected, onOpenChange };
}

describe("ConnectModal", () => {
  beforeEach(() => {
    connectMutateAsync.mockReset();
    emitterListeners.clear();
    Object.defineProperty(window, "ethereum", { configurable: true, value: { isMetaMask: true } });
  });

  afterEach(() => {
    vi.useRealTimers();
    Reflect.deleteProperty(window, "ethereum");
  });

  it("lists MetaMask and the injected browser wallet, never WalletConnect", () => {
    renderModal();

    const list = screen.getByRole("list", { name: /available wallets/i });
    expect(list).toHaveTextContent("MetaMask");
    expect(list).toHaveTextContent("Browser Wallet");
    expect(screen.queryByText(/walletconnect/i)).not.toBeInTheDocument();
  });

  it("connects on the configured chain and closes on success", async () => {
    connectMutateAsync.mockResolvedValue({ accounts: ["0x1"], chainId: 42161 });
    const { onConnected } = renderModal();

    await userEvent.click(screen.getByRole("button", { name: /browser wallet/i }));

    expect(connectMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ connector: connectors[1], chainId: 42161 })
    );
    expect(onConnected).toHaveBeenCalledTimes(1);
  });

  it("returns to the wallet list silently when the user rejects", async () => {
    connectMutateAsync.mockRejectedValue(Object.assign(new Error("User rejected the request"), { code: 4001 }));
    const { onConnected } = renderModal();

    await userEvent.click(screen.getByRole("button", { name: /browser wallet/i }));

    expect(onConnected).not.toHaveBeenCalled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("list", { name: /available wallets/i })).toBeInTheDocument();
  });

  it("shows the failure and offers a retry for other errors", async () => {
    connectMutateAsync.mockRejectedValueOnce(new Error("Provider is locked"));
    connectMutateAsync.mockResolvedValueOnce({ accounts: ["0x1"], chainId: 42161 });
    const { onConnected } = renderModal();

    await userEvent.click(screen.getByRole("button", { name: /browser wallet/i }));
    expect(screen.getByRole("alert")).toHaveTextContent(/provider is locked/i);

    await userEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(connectMutateAsync).toHaveBeenCalledTimes(2);
    expect(onConnected).toHaveBeenCalledTimes(1);
  });

  it("renders the MetaMask pairing QR code when the SDK announces a URI", async () => {
    let resolveConnect: (value: unknown) => void = () => undefined;
    connectMutateAsync.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveConnect = resolve;
        })
    );
    renderModal();

    await userEvent.click(screen.getByRole("button", { name: /^metamask/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/waiting for metamask/i);

    act(() => {
      for (const listener of emitterListeners) {
        listener({ type: "display_uri", data: "metamask://connect?channelId=abc" });
      }
    });

    expect(screen.getByRole("img", { name: /scan with the metamask mobile app/i })).toBeInTheDocument();
    act(() => resolveConnect({ accounts: ["0x1"], chainId: 42161 }));
  });

  it("offers the in-app browser link after a stalled mobile attempt", async () => {
    vi.spyOn(window.navigator, "userAgent", "get").mockReturnValue(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)"
    );
    connectMutateAsync.mockImplementation(() => new Promise(() => undefined));
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderModal();

    await userEvent.click(screen.getByRole("button", { name: /^metamask/i }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(8_000);
    });

    expect(screen.getByRole("link", { name: /open this page in metamask/i })).toHaveAttribute(
      "href",
      expect.stringMatching(/^https:\/\/metamask\.app\.link\/dapp\//)
    );
  });
});
