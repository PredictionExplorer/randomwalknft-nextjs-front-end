"use client";

import Image from "next/image";
import { ChevronRight, LoaderCircle, Wallet } from "lucide-react";
import { useEffect, useEffectEvent, useState, useSyncExternalStore } from "react";
import { useConnect, useConnectors } from "wagmi";

import { ExternalLink } from "@/components/common/external-link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { QrCode } from "@/components/wallet/qr-code";
import { trackEvent } from "@/lib/analytics";
import { classifyWalletError } from "@/lib/web3/errors";
import { getChainDisplayName, getConfiguredEvmChain } from "@/lib/web3/evm-chain";
import { buildWalletOptions, isMobileUserAgent, metaMaskDappLink, type WalletOption } from "@/lib/web3/wallet-options";
import { META_MASK_CONNECTOR_ID } from "@/lib/web3/wallets/meta-mask-wallet";

const STALLED_ATTEMPT_MS = 8_000;
const METAMASK_DOWNLOAD_URL = "https://metamask.io/download/";

function subscribeNoop() {
  return () => {
    // window.ethereum presence does not change after page load in practice.
  };
}
const hasWindowProvider = () => typeof window !== "undefined" && "ethereum" in window;
const noWindowProvider = () => false;

type Attempt = {
  option: WalletOption;
  status: "pending" | "error";
  message?: string;
  /** MetaMask mobile pairing URI, only when there is no extension to hand off to. */
  qrUri?: string;
};

type ConnectModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected: () => void;
};

export function ConnectModal({ open, onOpenChange, onConnected }: ConnectModalProps) {
  const connectors = useConnectors();
  const connect = useConnect();
  const windowProvider = useSyncExternalStore(subscribeNoop, hasWindowProvider, noWindowProvider);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [stalled, setStalled] = useState(false);
  const options = buildWalletOptions(connectors, windowProvider);
  const mobile = useSyncExternalStore(
    subscribeNoop,
    () => isMobileUserAgent(navigator),
    () => false
  );

  const handleDisplayUri = useEffectEvent((uri: string) => {
    setAttempt((current) => (current?.status === "pending" ? { ...current, qrUri: uri } : current));
  });

  // While MetaMask is pairing, the SDK announces the mobile URI through the connector's emitter.
  const pendingConnector = attempt?.status === "pending" ? attempt.option.connector : null;
  useEffect(() => {
    if (pendingConnector?.id !== META_MASK_CONNECTOR_ID) {
      return;
    }
    const listener = (message: { type: string; data?: unknown }) => {
      if (message.type === "display_uri" && typeof message.data === "string") {
        handleDisplayUri(message.data);
      }
    };
    pendingConnector.emitter.on("message", listener);
    return () => {
      pendingConnector.emitter.off("message", listener);
    };
  }, [pendingConnector]);

  // Mobile approvals bounce through the wallet app; offer the in-app browser when nothing returns.
  useEffect(() => {
    if (!pendingConnector || !mobile) {
      return;
    }
    const timer = window.setTimeout(() => setStalled(true), STALLED_ATTEMPT_MS);
    return () => window.clearTimeout(timer);
  }, [pendingConnector, mobile]);

  async function connectWith(option: WalletOption) {
    setStalled(false);
    setAttempt({ option, status: "pending" });
    trackEvent("wallet_connect_attempt", { mode: option.id });
    try {
      await connect.mutateAsync({ connector: option.connector, chainId: getConfiguredEvmChain().id });
      setAttempt(null);
      onConnected();
    } catch (error) {
      const classified = classifyWalletError(error);
      if (classified.severity === "info") {
        // User rejection: back to the list without an error banner.
        setAttempt(null);
        return;
      }
      setAttempt({ option, status: "error", message: classified.message });
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setAttempt(null);
      setStalled(false);
    }
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[min(92vw,26rem)] p-6" data-testid="connect-modal">
        <DialogTitle className="text-lg font-semibold tracking-tight">
          {attempt ? attempt.option.label : "Connect a wallet"}
        </DialogTitle>
        <DialogDescription className="mt-1 text-sm text-muted-foreground">
          {attempt
            ? attempt.status === "pending"
              ? "Approve the connection in your wallet."
              : "The wallet did not connect."
            : `Choose a wallet to use on ${getChainDisplayName()}.`}
        </DialogDescription>

        {attempt ? (
          <AttemptPanel
            attempt={attempt}
            stalled={stalled}
            mobile={mobile}
            onRetry={() => void connectWith(attempt.option)}
            onBack={() => {
              setAttempt(null);
              setStalled(false);
            }}
          />
        ) : (
          <ul className="mt-5 space-y-2" aria-label="Available wallets">
            {options.map((option) => (
              <li key={option.id}>
                <WalletOptionButton option={option} onSelect={() => void connectWith(option)} />
              </li>
            ))}
            {options.length === 0 ? (
              <li className="text-sm text-muted-foreground">No wallet connectors are available in this browser.</li>
            ) : null}
          </ul>
        )}

        {!attempt && !mobile ? (
          <p className="mt-5 text-xs text-muted-foreground">
            New to wallets?{" "}
            <ExternalLink href={METAMASK_DOWNLOAD_URL} className="text-secondary underline-offset-4 hover:underline">
              Install MetaMask
            </ExternalLink>{" "}
            and refresh this page.
          </p>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function WalletOptionButton({ option, onSelect }: { option: WalletOption; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-center gap-3 rounded-2xl border border-border/70 bg-card/60 p-3 text-left transition hover:border-secondary/60 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/95">
        {option.iconUrl ? (
          <Image src={option.iconUrl} alt="" width={28} height={28} unoptimized />
        ) : (
          <Wallet className="h-5 w-5 text-black" aria-hidden />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-foreground">{option.label}</span>
        <span className="block truncate text-xs text-muted-foreground">{option.description}</span>
      </span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
    </button>
  );
}

function AttemptPanel({
  attempt,
  stalled,
  mobile,
  onRetry,
  onBack
}: {
  attempt: Attempt;
  stalled: boolean;
  mobile: boolean;
  onRetry: () => void;
  onBack: () => void;
}) {
  const isMetaMask = attempt.option.connector.id === META_MASK_CONNECTOR_ID;

  return (
    <div className="mt-5 space-y-4" data-testid="connect-attempt">
      {attempt.status === "pending" ? (
        attempt.qrUri ? (
          <div className="space-y-3">
            <div className="mx-auto w-56 overflow-hidden rounded-2xl bg-white p-2">
              <QrCode
                value={attempt.qrUri}
                label="Scan with the MetaMask mobile app to connect"
                className="h-auto w-full"
              />
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Scan with the MetaMask mobile app. No extension detected in this browser.
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border border-border/70 p-4 text-sm text-muted-foreground">
            <LoaderCircle className="h-4 w-4 shrink-0 animate-spin text-secondary" aria-hidden />
            <span role="status">Waiting for {attempt.option.label}…</span>
          </div>
        )
      ) : (
        <p className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100" role="alert">
          {attempt.message}
        </p>
      )}

      {stalled && mobile && isMetaMask ? (
        <a
          href={metaMaskDappLink(window.location)}
          className="block text-center text-sm font-medium text-secondary underline-offset-4 hover:underline"
        >
          Open this page in MetaMask
        </a>
      ) : null}

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onBack}>
          Back
        </Button>
        {attempt.status === "error" ? (
          <Button className="flex-1" onClick={onRetry}>
            Try again
          </Button>
        ) : null}
      </div>
    </div>
  );
}
