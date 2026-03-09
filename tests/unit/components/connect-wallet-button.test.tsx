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

  it("connects directly when there is a single browser wallet option", async () => {
    render(<ConnectWalletButton />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /connect wallet/i }));
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
});
