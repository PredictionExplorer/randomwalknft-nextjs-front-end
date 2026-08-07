import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const openChainModal = vi.fn();
const openConnectModal = vi.fn();
const walletStatus = {
  isConnected: false,
  isConnecting: false,
  isReconnecting: false,
  isWrongNetwork: false
};

vi.mock("@rainbow-me/rainbowkit", () => ({
  useChainModal: () => ({ openChainModal }),
  useConnectModal: () => ({ openConnectModal })
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
    openChainModal.mockReset();
    openConnectModal.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("opens the connect modal for a disconnected wallet", async () => {
    renderStatusCard();

    await userEvent.click(screen.getByRole("button", { name: /connect wallet/i }));

    expect(openConnectModal).toHaveBeenCalledTimes(1);
  });

  it("opens the chain modal instead of permitting work on the wrong network", async () => {
    Object.assign(walletStatus, {
      isConnected: true,
      isWrongNetwork: true
    });
    renderStatusCard();

    await userEvent.click(screen.getByRole("button", { name: /switch network/i }));

    expect(openChainModal).toHaveBeenCalledTimes(1);
    expect(openConnectModal).not.toHaveBeenCalled();
  });

  it("disables connect while a recovery attempt is active", () => {
    walletStatus.isReconnecting = true;
    renderStatusCard();

    expect(screen.getByRole("button", { name: /connecting/i })).toBeDisabled();
  });

  it("offers a MetaMask in-app-browser fallback after a stalled mobile attempt", async () => {
    vi.useFakeTimers();
    vi.spyOn(window.navigator, "userAgent", "get").mockReturnValue(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)"
    );
    renderStatusCard();
    await act(async () => {
      await Promise.resolve();
    });

    fireEvent.click(screen.getByRole("button", { name: /connect wallet/i }));
    await act(async () => {
      vi.advanceTimersByTime(8_000);
    });

    expect(
      screen
        .getByRole("link", { name: /open this page in metamask/i })
        .getAttribute("href")
    ).toMatch(/^https:\/\/metamask\.app\.link\/dapp\//);
  });
});
