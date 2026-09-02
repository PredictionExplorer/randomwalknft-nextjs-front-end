"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { useReadContract } from "wagmi";

import { useContracts } from "@/components/providers/contracts-context";
import { Button } from "@/components/ui/button";
import { nftAbi } from "@/generated/wagmi";
import { formatId } from "@/lib/utils";
import { useWalletStatus } from "@/lib/web3/use-wallet-status";

type TokenNavProps = {
  tokenId: number;
  totalSupply: number;
};

/** True when the key press happened inside something that consumes arrow keys. */
function isEditableTarget(target: EventTarget | null) {
  return (
    target instanceof Element &&
    target.closest("input, textarea, select, [contenteditable=true], [role=dialog], [role=menu], [role=listbox]") !==
      null
  );
}

/**
 * Previous/next through the collection with arrow keys (ignored while typing), plus
 * "in your wallet" navigation for owners.
 */
export function TokenNav({ tokenId, totalSupply }: TokenNavProps) {
  const router = useRouter();
  const { NFT_ADDRESS } = useContracts();
  const { address } = useWalletStatus();
  const { data: walletTokens } = useReadContract({
    address: NFT_ADDRESS,
    abi: nftAbi,
    functionName: "walletOfOwner",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) }
  });

  const lastId = Math.max(0, totalSupply - 1);
  const previousId = tokenId > 0 ? tokenId - 1 : null;
  const nextId = tokenId < lastId ? tokenId + 1 : null;
  const walletIds = (walletTokens ?? []).map((id) => Number(id)).sort((a, b) => a - b);
  const walletIndex = walletIds.indexOf(tokenId);
  const previousInWallet = walletIndex > 0 ? walletIds[walletIndex - 1] : undefined;
  const nextInWallet = walletIndex >= 0 && walletIndex < walletIds.length - 1 ? walletIds[walletIndex + 1] : undefined;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target) || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      if (event.key === "ArrowLeft" && previousId !== null) {
        router.push(`/detail/${previousId}` as Route);
      } else if (event.key === "ArrowRight" && nextId !== null) {
        router.push(`/detail/${nextId}` as Route);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previousId, nextId, router]);

  return (
    <nav
      aria-label="Token navigation"
      className="flex flex-wrap items-center justify-between gap-3"
      data-testid="token-nav"
    >
      <div className="flex gap-2">
        <Button
          asChild
          variant="outline"
          size="sm"
          aria-disabled={previousId === null}
          className={previousId === null ? "pointer-events-none opacity-40" : ""}
        >
          <Link
            href={`/detail/${previousId ?? tokenId}` as Route}
            rel="prev"
            aria-label={previousId !== null ? `Previous work, ${formatId(previousId)}` : "No previous work"}
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            {previousId !== null ? formatId(previousId) : "Start"}
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          aria-disabled={nextId === null}
          className={nextId === null ? "pointer-events-none opacity-40" : ""}
        >
          <Link
            href={`/detail/${nextId ?? tokenId}` as Route}
            rel="next"
            aria-label={nextId !== null ? `Next work, ${formatId(nextId)}` : "No next work"}
          >
            {nextId !== null ? formatId(nextId) : "Newest"}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </Button>
        <span className="hidden self-center font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground sm:inline">
          ← → to browse · 1 2 3 media · I immersive
        </span>
      </div>
      {walletIndex >= 0 && walletIds.length > 1 ? (
        <div className="flex items-center gap-2" data-testid="wallet-nav">
          <span className="eyebrow">In your wallet</span>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className={previousInWallet === undefined ? "pointer-events-none opacity-40" : ""}
          >
            <Link href={`/detail/${previousInWallet ?? tokenId}` as Route}>Previous</Link>
          </Button>
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {walletIndex + 1} / {walletIds.length}
          </span>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className={nextInWallet === undefined ? "pointer-events-none opacity-40" : ""}
          >
            <Link href={`/detail/${nextInWallet ?? tokenId}` as Route}>Next</Link>
          </Button>
        </div>
      ) : null}
    </nav>
  );
}
