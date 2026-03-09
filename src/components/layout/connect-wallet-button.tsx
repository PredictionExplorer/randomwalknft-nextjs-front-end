"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { AlertTriangle, ChevronDown, ExternalLink, LoaderCircle, LogOut, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { arbitrum } from "wagmi/chains";
import { toast } from "sonner";

import { trackEvent } from "@/lib/analytics";
import { walletConnectEnabled, walletConnectSupportNote } from "@/lib/web3/rainbowkit";
import { getWalletOptions } from "@/lib/web3/wallets";
import { getErrorMessage } from "@/lib/web3/errors";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

function BrowserWalletFallback() {
  const { connectAsync, connectors, isPending } = useConnect();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [pendingWalletUid, setPendingWalletUid] = useState<string | null>(null);

  const walletOptions = useMemo(
    () => getWalletOptions([...connectors]),
    [connectors]
  );

  async function handleConnect(walletUid: string) {
    const wallet = walletOptions.find((option) => option.connector.uid === walletUid);
    if (!wallet) {
      return;
    }

    try {
      setPendingWalletUid(walletUid);
      trackEvent("wallet_connect_attempt", { wallet: wallet.label, mode: "browser-only" });
      await connectAsync({ connector: wallet.connector });
      trackEvent("wallet_connect_success", { wallet: wallet.label, mode: "browser-only" });
      setSheetOpen(false);
    } catch (error) {
      trackEvent("wallet_connect_error", {
        wallet: wallet.label,
        mode: "browser-only",
        message: getErrorMessage(error)
      });
      toast.error(getErrorMessage(error));
    } finally {
      setPendingWalletUid(null);
    }
  }

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Button variant="secondary" size="sm" disabled={isPending}>
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="space-y-6">
        <SheetTitle>Connect wallet</SheetTitle>
        <SheetDescription>{walletConnectSupportNote}</SheetDescription>
        <div className="space-y-3">
          {walletOptions.length ? (
            walletOptions.map((wallet) => (
              <Card key={wallet.connector.uid}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{wallet.label}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-3 pt-0">
                  <p className="text-sm text-muted-foreground">{wallet.description}</p>
                  <Button
                    size="sm"
                    onClick={() => void handleConnect(wallet.connector.uid)}
                    disabled={isPending}
                  >
                    {pendingWalletUid === wallet.connector.uid ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                    Continue
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-5 text-sm text-muted-foreground">
                No injected browser wallet was detected. Install a wallet extension such as MetaMask, Rabby, Brave Wallet, or Coinbase Wallet and refresh the page.
              </CardContent>
            </Card>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function ConnectWalletButton() {
  const { address, chain, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();

  if (!walletConnectEnabled) {
    if (!isConnected || !address) {
      return <BrowserWalletFallback />;
    }

    const wrongNetwork = chain?.id !== arbitrum.id;

    async function handleSwitchToArbitrum() {
      if (!switchChainAsync) {
        toast.error("Switch to Arbitrum in your wallet to continue.");
        return;
      }

      try {
        trackEvent("wallet_switch_network", { chainId: arbitrum.id, mode: "browser-only" });
        await switchChainAsync({ chainId: arbitrum.id });
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    }

    return (
      <div className="flex items-center gap-2">
        {wrongNetwork ? (
          <Button
            variant="destructive"
            size="sm"
            disabled={isSwitchingChain}
            onClick={() => {
              void handleSwitchToArbitrum();
            }}
          >
            {isSwitchingChain ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4" />}
            Switch to Arbitrum
          </Button>
        ) : null}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {address.slice(0, 6)}...{address.slice(-4)}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/my-nfts">My NFTs</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/my-offers">My Offers</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={`https://arbiscan.io/address/${address}`} target="_blank">
                View on Arbiscan
                <ExternalLink className="ml-auto h-4 w-4" />
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                disconnect();
              }}
            >
              Disconnect
              <LogOut className="ml-auto h-4 w-4" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        mounted,
        openAccountModal,
        openChainModal,
        openConnectModal
      }) => {
        const ready = mounted;
        const connected = Boolean(ready && account && chain);

        if (!connected) {
          return (
            <Button
              variant="secondary"
              size="sm"
              disabled={!openConnectModal}
              onClick={() => {
                trackEvent("wallet_connect_attempt", { mode: "rainbowkit" });
                openConnectModal();
              }}
            >
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </Button>
          );
        }

        const currentAccount = account!;
        const currentChain = chain!;
        const wrongNetwork = currentChain.id !== arbitrum.id || currentChain.unsupported;

        return (
          <div className="flex items-center gap-2">
            <Button
              variant={wrongNetwork ? "destructive" : "ghost"}
              size="sm"
              onClick={() => {
                if (wrongNetwork) {
                  trackEvent("wallet_switch_network", { chainId: arbitrum.id });
                }
                openChainModal();
              }}
            >
              {wrongNetwork ? (
                <>
                  <AlertTriangle className="h-4 w-4" />
                  Switch network
                </>
              ) : (
                currentChain.name ?? "Arbitrum"
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {currentAccount.displayName}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={openAccountModal}>Wallet details</DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/my-nfts">My NFTs</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/my-offers">My Offers</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href={`https://arbiscan.io/address/${currentAccount.address}`} target="_blank">
                    View on Arbiscan
                    <ExternalLink className="ml-auto h-4 w-4" />
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    disconnect();
                  }}
                >
                  Disconnect
                  <LogOut className="ml-auto h-4 w-4" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
