"use client";

import { useChainModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { AlertTriangle, CheckCircle2, PlugZap, Wallet } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trackEvent } from "@/lib/analytics";
import { useMounted } from "@/lib/use-mounted";
import {
  getChainDisplayName,
  getConfiguredEvmChain,
  getCurrentNetworkName,
  getRpcHttpUrl
} from "@/lib/web3/evm-chain";
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
  const { isConnected, isConnecting, isReconnecting, isWrongNetwork } = useWalletStatus();
  const { openChainModal } = useChainModal();
  const { openConnectModal } = useConnectModal();
  const mounted = useMounted();
  const [connectionAttempt, setConnectionAttempt] = useState(0);
  const [showMetaMaskFallback, setShowMetaMaskFallback] = useState(false);
  const mobile =
    mounted &&
    (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
  const metaMaskDappUrl = mobile
    ? `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`
    : "";

  useEffect(() => {
    if (connectionAttempt === 0 || isConnected || !metaMaskDappUrl) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setShowMetaMaskFallback(true);
    }, 8_000);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [connectionAttempt, isConnected, metaMaskDappUrl]);

  const Icon = !isConnected ? Wallet : isWrongNetwork ? AlertTriangle : CheckCircle2;

  const title = !isConnected
    ? disconnectedTitle
    : isWrongNetwork
      ? "Wrong network"
      : "Wallet connected";

  const siteOrigin = typeof window !== "undefined" ? window.location.origin : "";
  const localRpcNote =
    getCurrentNetworkName() === "local"
      ? ` MetaMask may show this site as ${siteOrigin || "this origin"} — that is only the app URL, not the blockchain node. In MetaMask → Networks, set this chain’s RPC URL to ${getRpcHttpUrl()} (Hardhat, port 8545).`
      : "";

  const body = !isConnected
    ? disconnectedBody
    : isWrongNetwork
      ? `${wrongNetworkBody}${getCurrentNetworkName() === "local" ? ` After switching, set the network’s RPC to ${getRpcHttpUrl()} if needed (not ${siteOrigin || "this site’s port"}).` : ""}`
      : `Your wallet is connected on ${getChainDisplayName()} and ready for transactions.${localRpcNote}`;

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
            disabled={!openConnectModal || isConnecting || isReconnecting}
            onClick={() => {
              setShowMetaMaskFallback(false);
              setConnectionAttempt((attempt) => attempt + 1);
              trackEvent("wallet_connect_attempt", { mode: "rainbowkit-status" });
              openConnectModal?.();
            }}
          >
            <PlugZap className="h-4 w-4" />
            {isConnecting || isReconnecting ? "Connecting..." : "Connect wallet"}
          </Button>
        ) : isWrongNetwork ? (
          <Button
            variant="destructive"
            disabled={!openChainModal}
            onClick={() => {
              trackEvent("wallet_switch_network", {
                chainId: getConfiguredEvmChain().id
              });
              openChainModal?.();
            }}
          >
            <AlertTriangle className="h-4 w-4" />
            Switch network
          </Button>
        ) : null}
        {!isConnected && showMetaMaskFallback ? (
          <a
            href={metaMaskDappUrl}
            className="text-sm font-medium text-secondary underline-offset-4 hover:underline"
          >
            Open this page in MetaMask
          </a>
        ) : null}
      </CardContent>
    </Card>
  );
}
