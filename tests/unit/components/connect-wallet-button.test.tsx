import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ConnectWalletButton } from "@/components/layout/connect-wallet-button";

const connectAsync = vi.fn();
const disconnect = vi.fn();
const switchChainAsync = vi.fn();

vi.mock("wagmi", () => ({
  useAccount: vi.fn(),
  useConnect: vi.fn(),
  useDisconnect: () => ({ disconnect }),
  useSwitchChain: () => ({ switchChainAsync })
}));

vi.mock("wagmi/chains", () => ({
  arbitrum: { id: 42161 }
}));

vi.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: {
    Custom: ({ children }: { children: (args: {
      account?: { address: string; displayName: string };
      chain?: { id: number; name: string; unsupported?: boolean };
      mounted: boolean;
      openAccountModal: () => void;
      openChainModal: () => void;
      openConnectModal: () => void;
    }) => React.ReactNode }) =>
      children({
        mounted: true,
        openAccountModal: vi.fn(),
        openChainModal: vi.fn(),
        openConnectModal: vi.fn()
      })
  }
}));

vi.mock("@/lib/web3/rainbowkit", () => ({
  walletConnectEnabled: false,
  walletConnectSupportNote:
    "WalletConnect project ID is missing. Browser-extension wallets still work, but QR and mobile wallet flows are disabled in this environment."
}));

describe("ConnectWalletButton", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    connectAsync.mockResolvedValue(undefined);
    const wagmi = await import("wagmi");
    vi.mocked(wagmi.useAccount).mockReturnValue({
      address: undefined,
      chain: undefined,
      isConnected: false
    } as never);
    vi.mocked(wagmi.useConnect).mockReturnValue({
      connectAsync,
      connectors: [{ uid: "injected-1", id: "injected", name: "Injected" }],
      isPending: false
    } as never);
  });

  it("opens the fallback wallet sheet and connects through the browser-wallet flow", async () => {
    render(<ConnectWalletButton />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /connect wallet/i }));
    });

    expect(screen.getByText(/walletconnect project id is missing/i)).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));
      await Promise.resolve();
    });
    expect(connectAsync).toHaveBeenCalledTimes(1);
  });

  it("renders the connected wallet menu when an account is active", async () => {
    const wagmi = await import("wagmi");
    vi.mocked(wagmi.useAccount).mockReturnValue({
      address: "0x1234567890abcdef1234567890abcdef12345678",
      chain: { id: 42161 },
      isConnected: true
    } as never);

    render(<ConnectWalletButton />);
    expect(screen.getByRole("button", { name: /0x1234/i })).toBeInTheDocument();
  });

  it("shows a switch action for connected browser wallets on the wrong network", async () => {
    const wagmi = await import("wagmi");
    vi.mocked(wagmi.useAccount).mockReturnValue({
      address: "0x1234567890abcdef1234567890abcdef12345678",
      chain: { id: 1 },
      isConnected: true
    } as never);

    render(<ConnectWalletButton />);
    expect(screen.getByRole("button", { name: /switch to arbitrum/i })).toBeInTheDocument();
  });
});
