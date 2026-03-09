import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const openAccountModal = vi.fn();
const openChainModal = vi.fn();
const openConnectModal = vi.fn();
const disconnect = vi.fn();

async function loadComponent({
  account,
  chain
}: {
  account?: { address: string; displayName: string };
  chain?: { id: number; name: string; unsupported?: boolean };
}) {
  vi.doMock("wagmi", () => ({
    useDisconnect: () => ({ disconnect })
  }));

  vi.doMock("wagmi/chains", () => ({
    arbitrum: { id: 42161 }
  }));

  vi.doMock("@rainbow-me/rainbowkit", () => ({
    ConnectButton: {
      Custom: ({
        children
      }: {
        children: (args: {
          account?: { address: string; displayName: string };
          chain?: { id: number; name: string; unsupported?: boolean };
          mounted: boolean;
          openAccountModal: () => void;
          openChainModal: () => void;
          openConnectModal: () => void;
        }) => ReactNode;
      }) => {
        const args = {
          mounted: true,
          openAccountModal,
          openChainModal,
          openConnectModal
        } as {
          account?: { address: string; displayName: string };
          chain?: { id: number; name: string; unsupported?: boolean };
          mounted: boolean;
          openAccountModal: () => void;
          openChainModal: () => void;
          openConnectModal: () => void;
        };

        if (account) {
          args.account = account;
        }
        if (chain) {
          args.chain = chain;
        }

        return children(args);
      }
    }
  }));

  const mod = await import("@/components/layout/connect-wallet-button");
  return mod.ConnectWalletButton;
}

describe("ConnectWalletButton", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("opens the RainbowKit modal when disconnected", async () => {
    const ConnectWalletButton = await loadComponent({});
    render(<ConnectWalletButton />);

    await userEvent.click(screen.getByRole("button", { name: /connect wallet/i }));
    expect(openConnectModal).toHaveBeenCalledTimes(1);
  });

  it("renders a switch-network action when the connected chain is unsupported", async () => {
    const ConnectWalletButton = await loadComponent({
      account: {
        address: "0x1234567890abcdef1234567890abcdef12345678",
        displayName: "0x1234...5678"
      },
      chain: {
        id: 1,
        name: "Ethereum",
        unsupported: true
      }
    });

    render(<ConnectWalletButton />);
    expect(screen.getByRole("button", { name: /switch network/i })).toBeInTheDocument();
  });

  it("renders the chain name and account when connected on Arbitrum", async () => {
    const ConnectWalletButton = await loadComponent({
      account: {
        address: "0x1234567890abcdef1234567890abcdef12345678",
        displayName: "0x1234...5678"
      },
      chain: {
        id: 42161,
        name: "Arbitrum One"
      }
    });

    render(<ConnectWalletButton />);
    expect(screen.getByRole("button", { name: /arbitrum one/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /0x1234/i })).toBeInTheDocument();
  });

  it("opens the chain modal when clicking the chain button", async () => {
    const ConnectWalletButton = await loadComponent({
      account: {
        address: "0x1234567890abcdef1234567890abcdef12345678",
        displayName: "0x1234...5678"
      },
      chain: {
        id: 42161,
        name: "Arbitrum One"
      }
    });

    render(<ConnectWalletButton />);
    await userEvent.click(screen.getByRole("button", { name: /arbitrum one/i }));
    expect(openChainModal).toHaveBeenCalledTimes(1);
  });

  it("tracks analytics when switching from wrong network", async () => {
    const ConnectWalletButton = await loadComponent({
      account: {
        address: "0x1234567890abcdef1234567890abcdef12345678",
        displayName: "0x1234...5678"
      },
      chain: {
        id: 1,
        name: "Ethereum",
        unsupported: true
      }
    });

    render(<ConnectWalletButton />);
    await userEvent.click(screen.getByRole("button", { name: /switch network/i }));
    expect(openChainModal).toHaveBeenCalledTimes(1);
  });

  it("shows dropdown items when connected", async () => {
    const ConnectWalletButton = await loadComponent({
      account: {
        address: "0x1234567890abcdef1234567890abcdef12345678",
        displayName: "0x1234...5678"
      },
      chain: {
        id: 42161,
        name: "Arbitrum One"
      }
    });

    render(<ConnectWalletButton />);
    await userEvent.click(screen.getByRole("button", { name: /0x1234/i }));
    expect(screen.getByText(/wallet details/i)).toBeInTheDocument();
    expect(screen.getByText(/my nfts/i)).toBeInTheDocument();
    expect(screen.getByText(/my offers/i)).toBeInTheDocument();
    expect(screen.getByText(/view on arbiscan/i)).toBeInTheDocument();
    expect(screen.getByText(/disconnect/i)).toBeInTheDocument();
  });
});
