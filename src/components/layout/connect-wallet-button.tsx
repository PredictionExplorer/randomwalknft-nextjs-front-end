"use client";

import Link from "next/link";
import { AlertTriangle, ChevronDown, ExternalLink as ExternalLinkIcon, LogOut, Wallet } from "lucide-react";
import { useDisconnect } from "wagmi";

import { ExternalLink } from "@/components/common/external-link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useWalletUi } from "@/components/wallet/wallet-provider";
import { trackEvent } from "@/lib/analytics";
import { arbiscanAddressUrl, shortenAddress } from "@/lib/utils";
import { getChainDisplayName, getConfiguredEvmChain } from "@/lib/web3/evm-chain";
import { useWalletStatus } from "@/lib/web3/use-wallet-status";

type ConnectWalletButtonProps = {
  /** Runs before the connect dialog opens (e.g. to close a mobile navigation sheet). */
  onBeforeOpen?: () => void;
};

export function ConnectWalletButton({ onBeforeOpen }: ConnectWalletButtonProps) {
  // Hydration-safe: reports disconnected until mounted, like the server HTML.
  const { address, chain, chainId, isConnected } = useWalletStatus();
  const disconnect = useDisconnect();
  const { openAccountModal, openChainModal, openConnectModal } = useWalletUi();

  if (!isConnected || !address) {
    return (
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          onBeforeOpen?.();
          trackEvent("wallet_connect_attempt", { mode: "header" });
          openConnectModal();
        }}
      >
        <Wallet className="h-4 w-4" aria-hidden />
        Connect Wallet
      </Button>
    );
  }

  const expectedChainId = getConfiguredEvmChain().id;
  // `chain` is undefined when the wallet sits on a network this app does not configure.
  const wrongNetwork = chain === undefined || chainId !== expectedChainId;

  return (
    <div className="flex items-center gap-2">
      {wrongNetwork ? (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            trackEvent("wallet_switch_network", { chainId: expectedChainId });
            openChainModal();
          }}
        >
          <AlertTriangle className="h-4 w-4" aria-hidden />
          Switch network
        </Button>
      ) : (
        <Button variant="ghost" size="sm" onClick={openChainModal}>
          {chain.name || getChainDisplayName()}
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            {shortenAddress(address)}
            <ChevronDown className="h-4 w-4" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={openAccountModal}>Wallet details</DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/my-nfts">My NFTs</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <ExternalLink href={arbiscanAddressUrl(address)}>
              View on block explorer
              <ExternalLinkIcon className="ml-auto h-4 w-4" aria-hidden />
            </ExternalLink>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              disconnect.mutate();
            }}
          >
            Disconnect
            <LogOut className="ml-auto h-4 w-4" aria-hidden />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
