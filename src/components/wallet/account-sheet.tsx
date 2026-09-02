"use client";

import Link from "next/link";
import { Copy, ExternalLink as ExternalLinkIcon, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useConnection, useDisconnect } from "wagmi";

import { ExternalLink } from "@/components/common/external-link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { getChainDisplayName } from "@/lib/web3/evm-chain";
import { arbiscanAddressUrl, shortenAddress } from "@/lib/utils";

type AccountSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AccountSheet({ open, onOpenChange }: AccountSheetProps) {
  const { address, connector } = useConnection();
  const disconnect = useDisconnect();

  if (!address) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(92vw,26rem)] p-6" data-testid="account-sheet">
        <DialogTitle className="text-lg font-semibold tracking-tight">Your wallet</DialogTitle>
        <DialogDescription className="mt-1 text-sm text-muted-foreground">
          Connected on {getChainDisplayName()}
          {connector ? ` via ${connector.name}` : ""}.
        </DialogDescription>

        <div className="mt-5 rounded-2xl border border-border/70 bg-card/60 p-4">
          <p className="text-[0.65rem] uppercase tracking-[0.28em] text-muted-foreground">Address</p>
          <p className="mt-1 break-all font-mono text-sm text-foreground" title={address}>
            {address}
          </p>
        </div>

        <div className="mt-4 grid gap-2">
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => {
              void navigator.clipboard.writeText(address).then(() => toast.success("Address copied."));
            }}
          >
            <Copy className="h-4 w-4" aria-hidden />
            Copy address
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <ExternalLink href={arbiscanAddressUrl(address)}>
              <ExternalLinkIcon className="h-4 w-4" aria-hidden />
              View {shortenAddress(address)} on the block explorer
            </ExternalLink>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link href="/my-nfts" onClick={() => onOpenChange(false)}>
              My NFTs
            </Link>
          </Button>
          <Button
            variant="destructive"
            className="justify-start"
            onClick={() => {
              disconnect.mutate(undefined, { onSettled: () => onOpenChange(false) });
            }}
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Disconnect
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
