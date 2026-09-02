import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { connection, disconnectMutate, walletUi } = vi.hoisted(() => ({
  connection: {
    address: undefined as string | undefined,
    chain: undefined as { id: number; name: string } | undefined,
    chainId: undefined as number | undefined,
    isConnected: false
  },
  disconnectMutate: vi.fn(),
  walletUi: {
    openAccountModal: vi.fn(),
    openChainModal: vi.fn(),
    openConnectModal: vi.fn()
  }
}));

vi.mock("wagmi", () => ({
  useConnection: () => connection,
  useDisconnect: () => ({ mutate: disconnectMutate })
}));

vi.mock("@/components/wallet/wallet-provider", () => ({
  useWalletUi: () => walletUi
}));

import { ConnectWalletButton } from "@/components/layout/connect-wallet-button";

const ADDRESS = "0x1234567890abcdef1234567890abcdef12345678";

function connectOn(chain: { id: number; name: string } | undefined, chainId: number) {
  Object.assign(connection, { address: ADDRESS, chain, chainId, isConnected: true });
}

describe("ConnectWalletButton", () => {
  beforeEach(() => {
    Object.assign(connection, { address: undefined, chain: undefined, chainId: undefined, isConnected: false });
    vi.clearAllMocks();
  });

  it("opens the connect dialog when disconnected", async () => {
    render(<ConnectWalletButton />);

    await userEvent.click(screen.getByRole("button", { name: /connect wallet/i }));
    expect(walletUi.openConnectModal).toHaveBeenCalledTimes(1);
  });

  it("closes a parent mobile menu before opening the wallet dialog", async () => {
    const onBeforeOpen = vi.fn();
    render(<ConnectWalletButton onBeforeOpen={onBeforeOpen} />);

    await userEvent.click(screen.getByRole("button", { name: /connect wallet/i }));

    expect(onBeforeOpen).toHaveBeenCalledTimes(1);
    expect(onBeforeOpen.mock.invocationCallOrder[0]).toBeLessThan(
      walletUi.openConnectModal.mock.invocationCallOrder[0] ?? Number.POSITIVE_INFINITY
    );
  });

  it("renders a switch-network action when the wallet is on an unconfigured chain", async () => {
    connectOn(undefined, 1);
    render(<ConnectWalletButton />);

    await userEvent.click(screen.getByRole("button", { name: /switch network/i }));
    expect(walletUi.openChainModal).toHaveBeenCalledTimes(1);
  });

  it("renders the chain name and shortened account when connected on Arbitrum", () => {
    connectOn({ id: 42161, name: "Arbitrum One" }, 42161);
    render(<ConnectWalletButton />);

    expect(screen.getByRole("button", { name: /arbitrum one/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /0x1234/i })).toBeInTheDocument();
  });

  it("shows account actions in the dropdown and disconnects through wagmi", async () => {
    connectOn({ id: 42161, name: "Arbitrum One" }, 42161);
    render(<ConnectWalletButton />);

    await userEvent.click(screen.getByRole("button", { name: /0x1234/i }));
    expect(screen.getByText(/wallet details/i)).toBeInTheDocument();
    expect(screen.getByText(/my nfts/i)).toBeInTheDocument();
    expect(screen.getByText(/view on block explorer/i)).toBeInTheDocument();

    await userEvent.click(screen.getByText(/disconnect/i));
    expect(disconnectMutate).toHaveBeenCalledTimes(1);
  });
});
