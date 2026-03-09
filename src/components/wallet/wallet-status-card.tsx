"use client";

import { AlertTriangle, CheckCircle2, PlugZap, Wallet } from "lucide-react";
import { useAccount, useConnect } from "wagmi";
import { arbitrum } from "wagmi/chains";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { WalletConnectionState } from "@/lib/types";
import { getWalletOptions } from "@/lib/web3/wallets";

type WalletStatusCardProps = {
  disconnectedTitle: string;
  disconnectedBody: string;
  wrongNetworkBody: string;
};

function getWalletState(
  isConnected: boolean,
  hasInstalledWallet: boolean,
  isWrongNetwork: boolean
): WalletConnectionState {
  if (!isConnected) {
    return {
      isConnected,
      hasInstalledWallet,
      isWrongNetwork,
      label: hasInstalledWallet ? "Wallet ready to connect" : "No wallet detected",
      description: hasInstalledWallet
        ? "A browser wallet was detected. Connect it to mint, trade, or redeem."
        : "Install a browser wallet such as MetaMask to access collector actions."
    };
  }

  if (isWrongNetwork) {
    return {
      isConnected,
      hasInstalledWallet,
      isWrongNetwork,
      label: "Wrong network",
      description: "Switch to Arbitrum to enable on-chain actions."
    };
  }

  return {
    isConnected,
    hasInstalledWallet,
    isWrongNetwork,
    label: "Wallet connected",
    description: "Your wallet is connected on Arbitrum and ready for transactions."
  };
}

export function WalletStatusCard({
  disconnectedTitle,
  disconnectedBody,
  wrongNetworkBody
}: WalletStatusCardProps) {
  const { isConnected, chain } = useAccount();
  const { connectAsync, connectors, isPending } = useConnect();

  const walletOptions = getWalletOptions(connectors.filter((connector) => connector.name !== "walletconnect"));
  const preferredWallet = walletOptions[0];
  const hasInstalledWallet = walletOptions.length > 0;
  const isWrongNetwork = Boolean(isConnected && chain?.id !== arbitrum.id);
  const walletState = getWalletState(isConnected, hasInstalledWallet, isWrongNetwork);

  const Icon = !isConnected ? Wallet : isWrongNetwork ? AlertTriangle : CheckCircle2;
  const body = !isConnected ? disconnectedBody : isWrongNetwork ? wrongNetworkBody : walletState.description;

  return (
    <Card className="border-border/80 bg-background/60">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-full border border-border/70 bg-accent/60 p-2 text-secondary">
            <Icon className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              {!isConnected ? disconnectedTitle : walletState.label}
            </p>
            <p className="text-sm leading-6 text-muted-foreground">{body}</p>
          </div>
        </div>
        {!isConnected && preferredWallet ? (
          <Button
            variant="secondary"
            onClick={() => void connectAsync({ connector: preferredWallet.connector })}
            disabled={isPending}
          >
            <PlugZap className="h-4 w-4" />
            Connect wallet
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
