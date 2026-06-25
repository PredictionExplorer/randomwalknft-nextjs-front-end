"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, ChevronDown, ExternalLink as ExternalLinkIcon, LogOut, Wallet } from "lucide-react";
import { useDisconnect } from "wagmi";

import { trackEvent } from "@/lib/analytics";
import { getChainDisplayName, getConfiguredEvmChain } from "@/lib/web3/evm-chain";
import { arbiscanAddressUrl } from "@/lib/utils";
import { ExternalLink } from "@/components/common/external-link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

type BrowserEthereumProvider = {
  request(args: { method: string; params?: Array<Record<string, string>> }): Promise<unknown>;
};

function getBrowserEthereum() {
  if (typeof window === "undefined") {
    return undefined;
  }
  return (window as Window & { ethereum?: BrowserEthereumProvider }).ethereum;
}

function E2eMockConnectWalletButton() {
  const [account, setAccount] = useState<string | undefined>();
  const [chainId, setChainId] = useState<string | undefined>();
  const expectedChainId = `0x${getConfiguredEvmChain().id.toString(16)}`;
  const wrongNetwork = Boolean(account && chainId && chainId.toLowerCase() !== expectedChainId);

  async function connect() {
    const ethereum = getBrowserEthereum();
    if (!ethereum) {
      return;
    }
    const accounts = (await ethereum.request({ method: "eth_requestAccounts" })) as string[];
    const currentChainId = (await ethereum.request({ method: "eth_chainId" })) as string;
    setAccount(accounts[0]);
    setChainId(currentChainId);
  }

  async function switchNetwork() {
    const ethereum = getBrowserEthereum();
    if (!ethereum) {
      return;
    }
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: expectedChainId }]
    });
    setChainId(expectedChainId);
  }

  if (!account) {
    return (
      <Button variant="secondary" size="sm" onClick={connect}>
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  if (wrongNetwork) {
    return (
      <Button variant="destructive" size="sm" onClick={switchNetwork}>
        <AlertTriangle className="h-4 w-4" />
        Switch network
      </Button>
    );
  }

  return (
    <Button variant="outline" size="sm">
      {account.slice(0, 6)}...{account.slice(-4)}
    </Button>
  );
}

function RainbowKitConnectWalletButton() {
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
        const expectedChainId = getConfiguredEvmChain().id;
        const wrongNetwork = currentChain.id !== expectedChainId || currentChain.unsupported;

        return (
          <div className="flex items-center gap-2">
            <Button
              variant={wrongNetwork ? "destructive" : "ghost"}
              size="sm"
              onClick={() => {
                if (wrongNetwork) {
                  trackEvent("wallet_switch_network", { chainId: expectedChainId });
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
                currentChain.name ?? getChainDisplayName()
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
                  <ExternalLink href={arbiscanAddressUrl(currentAccount.address)}>
                    View on block explorer
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

export function ConnectWalletButton() {
  return process.env.NEXT_PUBLIC_E2E_MOCK_WALLET === "true" ? (
    <E2eMockConnectWalletButton />
  ) : (
    <RainbowKitConnectWalletButton />
  );
}
