"use client";

import { AlertTriangle, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useConnection, useDisconnect, useSwitchChain } from "wagmi";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { trackEvent } from "@/lib/analytics";
import { classifyWalletError } from "@/lib/web3/errors";
import { getChainDisplayName, getConfiguredEvmChain } from "@/lib/web3/evm-chain";

type ChainPromptProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** Asks the wallet to switch (or add, then switch) to the configured network. */
export function ChainPrompt({ open, onOpenChange }: ChainPromptProps) {
  const { chain } = useConnection();
  const switchChain = useSwitchChain();
  const disconnect = useDisconnect();
  const [error, setError] = useState<string | null>(null);
  const target = getConfiguredEvmChain();
  const onTarget = chain?.id === target.id;

  async function handleSwitch() {
    setError(null);
    trackEvent("wallet_switch_network", { chainId: target.id });
    try {
      await switchChain.mutateAsync({ chainId: target.id });
      onOpenChange(false);
    } catch (switchError) {
      const classified = classifyWalletError(switchError);
      if (classified.severity !== "info") {
        setError(classified.message);
      }
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setError(null);
        onOpenChange(next);
      }}
    >
      <DialogContent className="w-[min(92vw,26rem)] p-6" data-testid="chain-prompt">
        <DialogTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          {onTarget ? null : <AlertTriangle className="h-5 w-5 text-accent" aria-hidden />}
          {onTarget ? "Network" : "Wrong network"}
        </DialogTitle>
        <DialogDescription className="mt-1 text-sm text-muted-foreground">
          {onTarget
            ? `Your wallet is connected to ${getChainDisplayName()}.`
            : `This site runs on ${getChainDisplayName()}. Switch your wallet to continue; if the network is missing, your wallet will offer to add it.`}
        </DialogDescription>

        {error ? (
          <p className="mt-4 rounded-md border border-danger/40 bg-danger/10 p-3 text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex flex-col gap-2">
          {onTarget ? null : (
            <Button onClick={() => void handleSwitch()} disabled={switchChain.isPending}>
              {switchChain.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : null}
              Switch to {getChainDisplayName()}
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={() => {
              disconnect.mutate(undefined, { onSettled: () => onOpenChange(false) });
            }}
          >
            Disconnect instead
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
