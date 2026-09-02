"use client";

import { createContext, use, useState } from "react";
import { useConnectionEffect } from "wagmi";

import { AccountSheet } from "@/components/wallet/account-sheet";
import { ChainPrompt } from "@/components/wallet/chain-prompt";
import { ConnectModal } from "@/components/wallet/connect-modal";

type WalletModal = "connect" | "account" | "chain";

type WalletUiContextValue = {
  openConnectModal: () => void;
  openAccountModal: () => void;
  openChainModal: () => void;
};

const WalletUiContext = createContext<WalletUiContextValue | null>(null);

/**
 * Owns the site's wallet dialogs (connect, account, network) so any component can
 * open them without RainbowKit-style global state.
 */
export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [modal, setModal] = useState<WalletModal | null>(null);

  useConnectionEffect({
    // A connection established anywhere (including a silent reconnect) closes the picker.
    onConnect: () => setModal((current) => (current === "connect" ? null : current)),
    onDisconnect: () => setModal((current) => (current === "account" || current === "chain" ? null : current))
  });

  const value: WalletUiContextValue = {
    openConnectModal: () => setModal("connect"),
    openAccountModal: () => setModal("account"),
    openChainModal: () => setModal("chain")
  };

  return (
    <WalletUiContext value={value}>
      {children}
      <ConnectModal
        open={modal === "connect"}
        onOpenChange={(open) => setModal(open ? "connect" : null)}
        onConnected={() => setModal(null)}
      />
      <AccountSheet open={modal === "account"} onOpenChange={(open) => setModal(open ? "account" : null)} />
      <ChainPrompt open={modal === "chain"} onOpenChange={(open) => setModal(open ? "chain" : null)} />
    </WalletUiContext>
  );
}

export function useWalletUi(): WalletUiContextValue {
  const context = use(WalletUiContext);
  if (!context) {
    throw new Error("useWalletUi must be used within WalletProvider");
  }
  return context;
}
