import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { walletStatus, walletUi } = vi.hoisted(() => ({
  walletStatus: {
    isConnected: false,
    isConnecting: false,
    isReconnecting: false,
    isWrongNetwork: false
  },
  walletUi: { openChainModal: vi.fn(), openConnectModal: vi.fn() }
}));

vi.mock("@/components/wallet/wallet-provider", () => ({
  useWalletUi: () => walletUi
}));

vi.mock("@/lib/web3/use-wallet-status", () => ({
  useWalletStatus: () => walletStatus
}));

import { WalletStatusCard } from "@/components/wallet/wallet-status-card";

function renderStatusCard() {
  return render(
    <WalletStatusCard
      disconnectedTitle="Wallet required"
      disconnectedBody="Connect to continue."
      wrongNetworkBody="Switch networks."
    />
  );
}

describe("WalletStatusCard", () => {
  beforeEach(() => {
    Object.assign(walletStatus, {
      isConnected: false,
      isConnecting: false,
      isReconnecting: false,
      isWrongNetwork: false
    });
    vi.clearAllMocks();
  });

  it("opens the connect dialog for a disconnected wallet", async () => {
    renderStatusCard();

    await userEvent.click(screen.getByRole("button", { name: /connect wallet/i }));

    expect(walletUi.openConnectModal).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Wallet required")).toBeInTheDocument();
  });

  it("opens the network prompt instead of permitting work on the wrong network", async () => {
    Object.assign(walletStatus, { isConnected: true, isWrongNetwork: true });
    renderStatusCard();

    await userEvent.click(screen.getByRole("button", { name: /switch network/i }));

    expect(walletUi.openChainModal).toHaveBeenCalledTimes(1);
    expect(walletUi.openConnectModal).not.toHaveBeenCalled();
    expect(screen.getByText("Wrong network")).toBeInTheDocument();
  });

  it("disables connect while a recovery attempt is active", () => {
    walletStatus.isReconnecting = true;
    renderStatusCard();

    expect(screen.getByRole("button", { name: /connecting/i })).toBeDisabled();
  });

  it("confirms a ready wallet without offering any action", () => {
    walletStatus.isConnected = true;
    renderStatusCard();

    expect(screen.getByText("Wallet connected")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
