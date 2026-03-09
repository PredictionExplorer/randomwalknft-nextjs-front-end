"use client";

import { useConnectModal } from "@rainbow-me/rainbowkit";
import { AlertTriangle, CheckCircle2, PlugZap, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trackEvent } from "@/lib/analytics";
import { useWalletStatus } from "@/lib/web3/use-wallet-status";

type WalletStatusCardProps = {
  disconnectedTitle: string;
  disconnectedBody: string;
  wrongNetworkBody: string;
};

export function WalletStatusCard({
  disconnectedTitle,
  disconnectedBody,
  wrongNetworkBody
}: WalletStatusCardProps) {
  const { isConnected, isWrongNetwork } = useWalletStatus();
  const { openConnectModal } = useConnectModal();

  const Icon = !isConnected ? Wallet : isWrongNetwork ? AlertTriangle : CheckCircle2;

  const title = !isConnected
    ? disconnectedTitle
    : isWrongNetwork
      ? "Wrong network"
      : "Wallet connected";

  const body = !isConnected
    ? disconnectedBody
    : isWrongNetwork
      ? wrongNetworkBody
      : "Your wallet is connected on Arbitrum and ready for transactions.";

  return (
    <Card className="border-border/80 bg-background/60">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-full border border-border/70 bg-accent/60 p-2 text-secondary">
            <Icon className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="text-sm leading-6 text-muted-foreground">{body}</p>
          </div>
        </div>
        {!isConnected ? (
          <Button
            variant="secondary"
            onClick={() => {
              trackEvent("wallet_connect_attempt", { mode: "rainbowkit-status" });
              openConnectModal?.();
            }}
          >
            <PlugZap className="h-4 w-4" />
            Connect wallet
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
