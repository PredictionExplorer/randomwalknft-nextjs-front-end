"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, Send, Tag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { isAddress } from "viem";
import { usePublicClient, useReadContract, useWriteContract } from "wagmi";

import { ExternalLink } from "@/components/common/external-link";
import { useContracts } from "@/components/providers/contracts-context";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { WalletStatusCard } from "@/components/wallet/wallet-status-card";
import { nftAbi } from "@/generated/wagmi";
import { trackEvent } from "@/lib/analytics";
import { AXIOM_ZERO_MARKETPLACE_URL, COSMIC_SIGNATURE_URL } from "@/lib/config";
import { formatId, shortenAddress } from "@/lib/utils";
import { getErrorMessage } from "@/lib/web3/errors";
import { getChainDisplayName } from "@/lib/web3/evm-chain";
import { prepareContractWrite } from "@/lib/web3/transaction-preflight";
import { useWalletStatus } from "@/lib/web3/use-wallet-status";
import { showWalletError } from "@/lib/web3/wallet-toast";

type CollectorToolsProps = {
  tokenId: number;
  /** Owner as the indexer knows it; the chain read below overrides it when connected. */
  owner: string;
  name: string;
};

/**
 * What the owner can do with the token on-chain: name it and send it. Everyone
 * else sees where to acquire one. Every write is simulated first and confirmed
 * before the page refreshes with the new state.
 */
export function CollectorTools({ tokenId, owner, name }: CollectorToolsProps) {
  const router = useRouter();
  const { NFT_ADDRESS } = useContracts();
  const publicClient = usePublicClient();
  const writeContract = useWriteContract();
  const { address, canTransact, isConnected, isWrongNetwork } = useWalletStatus();
  const { data: ownerOf } = useReadContract({
    address: NFT_ADDRESS,
    abi: nftAbi,
    functionName: "ownerOf",
    args: [BigInt(tokenId)]
  });
  const liveOwner = ownerOf ?? owner;
  const isOwner = address?.toLowerCase() === liveOwner.toLowerCase();

  const [tokenName, setTokenName] = useState(name);
  const [recipient, setRecipient] = useState("");
  const [confirmTransfer, setConfirmTransfer] = useState(false);
  const [busy, setBusy] = useState<"rename" | "transfer" | null>(null);

  async function runWrite(kind: "rename" | "transfer", action: () => Promise<void>) {
    try {
      setBusy(kind);
      trackEvent("transaction_submitted", { tokenId, flow: kind });
      await action();
      trackEvent("transaction_confirmed", { tokenId, flow: kind });
      toast.success(kind === "rename" ? "Name updated on-chain." : `${formatId(tokenId)} transferred.`);
      router.refresh();
    } catch (error) {
      trackEvent("transaction_failed", { tokenId, flow: kind, message: getErrorMessage(error) });
      showWalletError(error);
    } finally {
      setBusy(null);
    }
  }

  async function rename() {
    const trimmed = tokenName.trim();
    if (!trimmed) throw new Error("Name cannot be empty.");
    if (!publicClient || !address || !canTransact)
      throw new Error(`Connect your wallet on ${getChainDisplayName()} to continue.`);

    const prepared = await prepareContractWrite({
      publicClient,
      account: address,
      address: NFT_ADDRESS,
      abi: nftAbi,
      functionName: "setTokenName",
      args: [BigInt(tokenId), trimmed]
    });
    const hash = await writeContract.mutateAsync({
      address: NFT_ADDRESS,
      abi: nftAbi,
      functionName: "setTokenName",
      args: [BigInt(tokenId), trimmed],
      ...prepared
    });
    await publicClient.waitForTransactionReceipt({ hash });
  }

  async function transfer() {
    if (!isAddress(recipient)) throw new Error("Enter a valid wallet address.");
    if (!publicClient || !address || !canTransact)
      throw new Error(`Connect your wallet on ${getChainDisplayName()} to continue.`);

    const prepared = await prepareContractWrite({
      publicClient,
      account: address,
      address: NFT_ADDRESS,
      abi: nftAbi,
      functionName: "transferFrom",
      args: [address, recipient, BigInt(tokenId)]
    });
    const hash = await writeContract.mutateAsync({
      address: NFT_ADDRESS,
      abi: nftAbi,
      functionName: "transferFrom",
      args: [address, recipient, BigInt(tokenId)],
      ...prepared
    });
    await publicClient.waitForTransactionReceipt({ hash });
  }

  if (!isOwner) {
    return (
      <div className="space-y-4" data-testid="collector-tools">
        <div>
          <p className="eyebrow">Collect</p>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            Secondary listings and offers for Random Walk NFTs live on Axiom Zero. Holders can also put their work to
            use in Cosmic Signature for rewards and gesture discounts.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <ExternalLink href={AXIOM_ZERO_MARKETPLACE_URL} showIcon>
              Open on Axiom Zero
            </ExternalLink>
          </Button>
          <Button asChild variant="outline" size="sm">
            <ExternalLink href={COSMIC_SIGNATURE_URL} showIcon>
              Use in Cosmic Signature
            </ExternalLink>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/mint">
              <KeyRound className="h-3.5 w-3.5" aria-hidden />
              Mint your own
            </Link>
          </Button>
        </div>
        {isConnected && isWrongNetwork ? (
          <WalletStatusCard
            disconnectedTitle="Wallet required"
            disconnectedBody="Connect the wallet that owns this work to rename or transfer it."
            wrongNetworkBody={`Switch to ${getChainDisplayName()} to manage this work.`}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="collector-tools">
      <div>
        <p className="eyebrow text-accent">You own this work</p>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          Name it on-chain, send it to another wallet, list it on Axiom Zero, or anchor it in Cosmic Signature.
        </p>
      </div>

      {!canTransact ? (
        <WalletStatusCard
          disconnectedTitle="Wallet required"
          disconnectedBody="Connect the wallet that owns this work to rename or transfer it."
          wrongNetworkBody={`Switch to ${getChainDisplayName()} to manage this work.`}
        />
      ) : null}

      <form
        className="space-y-2"
        onSubmit={(event) => {
          event.preventDefault();
          void runWrite("rename", rename);
        }}
      >
        <label htmlFor="token-name" className="eyebrow block">
          Name
        </label>
        <div className="flex gap-2">
          <Input
            id="token-name"
            value={tokenName}
            onChange={(event) => setTokenName(event.target.value)}
            placeholder="Give this walk a name"
            maxLength={64}
            disabled={busy !== null}
          />
          <Button type="submit" disabled={busy !== null || !canTransact || tokenName.trim() === name}>
            <Tag className="h-3.5 w-3.5" aria-hidden />
            {busy === "rename" ? "Confirming…" : "Save"}
          </Button>
        </div>
      </form>

      <form
        className="space-y-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!isAddress(recipient)) {
            toast.error("Enter a valid wallet address.");
            return;
          }
          setConfirmTransfer(true);
        }}
      >
        <label htmlFor="transfer-address" className="eyebrow block">
          Transfer to
        </label>
        <div className="flex gap-2">
          <Input
            id="transfer-address"
            value={recipient}
            onChange={(event) => setRecipient(event.target.value)}
            placeholder="0x… recipient address"
            className="font-mono"
            autoComplete="off"
            spellCheck={false}
            disabled={busy !== null}
          />
          <Button type="submit" variant="outline" disabled={busy !== null || !canTransact || !recipient}>
            <Send className="h-3.5 w-3.5" aria-hidden />
            {busy === "transfer" ? "Confirming…" : "Send"}
          </Button>
        </div>
      </form>

      <div className="flex flex-wrap gap-2 border-t border-border pt-4">
        <Button asChild variant="outline" size="sm">
          <ExternalLink href={AXIOM_ZERO_MARKETPLACE_URL} showIcon>
            List on Axiom Zero
          </ExternalLink>
        </Button>
        <Button asChild variant="outline" size="sm">
          <ExternalLink href={COSMIC_SIGNATURE_URL} showIcon>
            Use in Cosmic Signature
          </ExternalLink>
        </Button>
      </div>

      <Dialog open={confirmTransfer} onOpenChange={setConfirmTransfer}>
        <DialogContent className="w-[min(92vw,26rem)] p-6">
          <DialogTitle className="text-lg font-medium tracking-tight">Transfer {formatId(tokenId)}?</DialogTitle>
          <DialogDescription className="mt-2 text-sm leading-6 text-muted-foreground">
            This sends the token to{" "}
            <span className="font-mono text-foreground">
              {isAddress(recipient) ? shortenAddress(recipient, 6) : recipient}
            </span>{" "}
            on {getChainDisplayName()}. Transfers cannot be undone by anyone, including the creators.
          </DialogDescription>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmTransfer(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirmTransfer(false);
                void runWrite("transfer", transfer);
              }}
            >
              Transfer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
