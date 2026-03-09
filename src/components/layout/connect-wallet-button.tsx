"use client";

import Link from "next/link";
import { ChevronDown, ExternalLink, LoaderCircle, LogOut, Wallet } from "lucide-react";
import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { arbitrum } from "wagmi/chains";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { shortenAddress } from "@/lib/utils";
import { getErrorMessage } from "@/lib/web3/errors";
import { getWalletOptions } from "@/lib/web3/wallets";

export function ConnectWalletButton() {
  const { address, chain, isConnected } = useAccount();
  const { connectAsync, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const [pendingWalletUid, setPendingWalletUid] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const walletOptions = getWalletOptions(
    connectors.filter((connector) => connector.name.toLowerCase() !== "walletconnect")
  );

  async function handleConnect(walletUid: string) {
    const wallet = walletOptions.find((option) => option.connector.uid === walletUid);
    if (!wallet) {
      return;
    }

    try {
      setPendingWalletUid(walletUid);
      await connectAsync({ connector: wallet.connector });
      setSheetOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setPendingWalletUid(null);
    }
  }

  if (!isConnected || !address) {
    if (walletOptions.length <= 1) {
      const onlyWallet = walletOptions[0];

      return (
        <Button
          variant="secondary"
          size="sm"
          disabled={isPending || !onlyWallet}
          onClick={() => {
            if (onlyWallet) {
              void handleConnect(onlyWallet.connector.uid);
            }
          }}
        >
          {pendingWalletUid ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
          Connect Wallet
        </Button>
      );
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
          <SheetDescription>
            Connect with a supported browser wallet on Arbitrum.
          </SheetDescription>
          <div className="space-y-3 pt-4">
            {walletOptions.map((wallet) => (
              <Card key={wallet.connector.uid} className="border-border/80">
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
                    {pendingWalletUid === wallet.connector.uid ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : null}
                    Connect
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  const wrongNetwork = chain?.id !== arbitrum.id;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          {shortenAddress(address)}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {wrongNetwork ? (
          <DropdownMenuItem onClick={() => switchChainAsync({ chainId: arbitrum.id })}>
            Switch to Arbitrum
          </DropdownMenuItem>
        ) : null}
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
        <DropdownMenuItem onClick={() => disconnect()}>
          Disconnect
          <LogOut className="ml-auto h-4 w-4" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
