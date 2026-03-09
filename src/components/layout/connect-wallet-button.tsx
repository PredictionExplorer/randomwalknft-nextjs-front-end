"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { AlertTriangle, ChevronDown, ExternalLink as ExternalLinkIcon, LogOut, Wallet } from "lucide-react";
import { useDisconnect } from "wagmi";
import { arbitrum } from "wagmi/chains";

import { trackEvent } from "@/lib/analytics";
import { arbiscanAddressUrl } from "@/lib/utils";
import { ExternalLink } from "@/components/common/external-link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export function ConnectWalletButton() {
  const { disconnect } = useDisconnect();

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
                  <ExternalLink href={arbiscanAddressUrl(currentAccount.address)}>
                    View on Arbiscan
                    <ExternalLinkIcon className="ml-auto h-4 w-4" />
                  </ExternalLink>
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
