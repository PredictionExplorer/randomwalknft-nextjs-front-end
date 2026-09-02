"use client";

import { AlertTriangle, CheckCircle2, PlugZap, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useWalletUi } from "@/components/wallet/wallet-provider";
import { trackEvent } from "@/lib/analytics";
import { getChainDisplayName, getConfiguredEvmChain, getCurrentNetworkName, getRpcHttpUrl } from "@/lib/web3/evm-chain";
import { useWalletStatus } from "@/lib/web3/use-wallet-status";

type WalletStatusCardProps = {
  disconnectedTitle: string;
  disconnectedBody: string;
  wrongNetworkBody: string;
};

export function WalletStatusCard({ disconnectedTitle, disconnectedBody, wrongNetworkBody }: WalletStatusCardProps) {
  const { isConnected, isConnecting, isReconnecting, isWrongNetwork } = useWalletStatus();
  const { openChainModal, openConnectModal } = useWalletUi();

  const Icon = !isConnected ? Wallet : isWrongNetwork ? AlertTriangle : CheckCircle2;
  const title = !isConnected ? disconnectedTitle : isWrongNetwork ? "Wrong network" : "Wallet connected";

  const localRpcNote =
    getCurrentNetworkName() === "local"
      ? ` MetaMask may show this site's origin as the connected website — that is only the app URL, not the blockchain node. In MetaMask → Networks, set this chain's RPC URL to ${getRpcHttpUrl()} (Hardhat, port 8545).`
      : "";

  const body = !isConnected
    ? disconnectedBody
    : isWrongNetwork
      ? `${wrongNetworkBody}${getCurrentNetworkName() === "local" ? ` After switching, set the network's RPC to ${getRpcHttpUrl()} if needed.` : ""}`
      : `Your wallet is connected on ${getChainDisplayName()} and ready for transactions.${localRpcNote}`;

  return (
    <Card className="border-border bg-surface">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-md border border-accent/40 bg-accent-soft p-2 text-accent">
            <Icon className="h-5 w-5" aria-hidden />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="text-sm leading-6 text-muted-foreground">{body}</p>
          </div>
        </div>
        {!isConnected ? (
          <Button
            variant="secondary"
            disabled={isConnecting || isReconnecting}
            onClick={() => {
              trackEvent("wallet_connect_attempt", { mode: "status-card" });
              openConnectModal();
            }}
          >
            <PlugZap className="h-4 w-4" aria-hidden />
            {isConnecting || isReconnecting ? "Connecting..." : "Connect wallet"}
          </Button>
        ) : isWrongNetwork ? (
          <Button
            variant="destructive"
            onClick={() => {
              trackEvent("wallet_switch_network", { chainId: getConfiguredEvmChain().id });
              openChainModal();
            }}
          >
            <AlertTriangle className="h-4 w-4" aria-hidden />
            Switch network
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
