import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { connection, connectionEffects, switchChainMutateAsync } = vi.hoisted(() => ({
  connection: {
    address: undefined as string | undefined,
    chain: undefined as { id: number; name: string } | undefined,
    chainId: undefined as number | undefined,
    connector: undefined as { name: string } | undefined,
    isConnected: false
  },
  connectionEffects: [] as Array<{ onConnect?: () => void; onDisconnect?: () => void }>,
  switchChainMutateAsync: vi.fn()
}));

vi.mock("wagmi", () => ({
  useConnection: () => connection,
  useConnectionEffect: (handlers: { onConnect?: () => void; onDisconnect?: () => void }) => {
    connectionEffects.push(handlers);
  },
  useConnectors: () => [],
  useConnect: () => ({ mutateAsync: vi.fn() }),
  useDisconnect: () => ({ mutate: vi.fn() }),
  useSwitchChain: () => ({ mutateAsync: switchChainMutateAsync, isPending: false })
}));

import { useWalletUi, WalletProvider } from "@/components/wallet/wallet-provider";

function Controls() {
  const ui = useWalletUi();
  return (
    <div>
      <button onClick={ui.openConnectModal}>open connect</button>
      <button onClick={ui.openAccountModal}>open account</button>
      <button onClick={ui.openChainModal}>open chain</button>
    </div>
  );
}

describe("WalletProvider", () => {
  beforeEach(() => {
    connectionEffects.length = 0;
    switchChainMutateAsync.mockReset();
    Object.assign(connection, {
      address: undefined,
      chain: undefined,
      chainId: undefined,
      connector: undefined,
      isConnected: false
    });
  });

  it("throws when the hook is used outside the provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<Controls />)).toThrow(/within WalletProvider/);
  });

  it("opens the connect dialog and lets it be dismissed", async () => {
    render(
      <WalletProvider>
        <Controls />
      </WalletProvider>
    );

    await userEvent.click(screen.getByRole("button", { name: /open connect/i }));
    expect(screen.getByTestId("connect-modal")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(screen.queryByTestId("connect-modal")).not.toBeInTheDocument();
  });

  it("opens the network prompt and switches to the configured chain", async () => {
    Object.assign(connection, {
      address: "0x1234567890abcdef1234567890abcdef12345678",
      chain: undefined,
      chainId: 1,
      isConnected: true
    });
    switchChainMutateAsync.mockResolvedValue({ id: 42161 });
    render(
      <WalletProvider>
        <Controls />
      </WalletProvider>
    );

    await userEvent.click(screen.getByRole("button", { name: /open chain/i }));
    expect(screen.getByTestId("chain-prompt")).toHaveTextContent(/wrong network/i);

    await userEvent.click(screen.getByRole("button", { name: /switch to arbitrum one/i }));
    expect(switchChainMutateAsync).toHaveBeenCalledWith({ chainId: 42161 });
    expect(screen.queryByTestId("chain-prompt")).not.toBeInTheDocument();
  });

  it("shows the account sheet with the full address and explorer link", async () => {
    Object.assign(connection, {
      address: "0x1234567890abcdef1234567890abcdef12345678",
      chain: { id: 42161, name: "Arbitrum One" },
      chainId: 42161,
      connector: { name: "MetaMask" },
      isConnected: true
    });
    render(
      <WalletProvider>
        <Controls />
      </WalletProvider>
    );

    await userEvent.click(screen.getByRole("button", { name: /open account/i }));
    const sheet = screen.getByTestId("account-sheet");
    expect(sheet).toHaveTextContent("0x1234567890abcdef1234567890abcdef12345678");
    expect(sheet).toHaveTextContent(/via metamask/i);
    expect(screen.getByRole("link", { name: /block explorer/i })).toHaveAttribute(
      "href",
      expect.stringContaining("0x1234567890abcdef1234567890abcdef12345678")
    );
  });

  it("closes the connect dialog when a connection is established elsewhere", async () => {
    render(
      <WalletProvider>
        <Controls />
      </WalletProvider>
    );
    await userEvent.click(screen.getByRole("button", { name: /open connect/i }));
    expect(screen.getByTestId("connect-modal")).toBeInTheDocument();

    const { act } = await import("@testing-library/react");
    act(() => {
      for (const effect of connectionEffects) effect.onConnect?.();
    });
    expect(screen.queryByTestId("connect-modal")).not.toBeInTheDocument();
  });
});
