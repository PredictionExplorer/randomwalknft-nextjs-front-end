"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSignMessage } from "wagmi";
import { z } from "zod";

import { NftCard } from "@/components/nft/nft-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { WalletStatusCard } from "@/components/wallet/wallet-status-card";
import { useWalletUi } from "@/components/wallet/wallet-provider";
import { trackEvent } from "@/lib/analytics";
import { cn, formatId } from "@/lib/utils";
import { buildBeautyVoteMessage } from "@/lib/web3/beauty-vote-message";
import { getChainDisplayName, getConfiguredEvmChain } from "@/lib/web3/evm-chain";
import { useWalletStatus } from "@/lib/web3/use-wallet-status";
import { showWalletError } from "@/lib/web3/wallet-toast";

const compareResponseSchema = z.object({
  tokenIds: z.array(z.number()),
  totalCount: z.number(),
  signNonce: z.string().min(1),
  pairExhausted: z.boolean().optional()
});

type CompareResponse = z.infer<typeof compareResponseSchema>;

async function getComparePair(opts: { voter?: string; skipPairFilter?: boolean }): Promise<CompareResponse> {
  const params = new URLSearchParams();
  if (opts.voter) {
    params.set("voter", opts.voter);
  }
  if (opts.skipPairFilter) {
    params.set("skip_pair_filter", "1");
  }
  const qs = params.toString();
  const response = await fetch(qs ? `/api/compare?${qs}` : "/api/compare");
  if (!response.ok) {
    throw new Error("Failed to fetch comparison pair.");
  }

  const data: unknown = await response.json();
  return compareResponseSchema.parse(data);
}

async function submitVote(payload: {
  firstId: number;
  secondId: number;
  winner: number;
  signNonce: string;
  signature: `0x${string}`;
  chainId: number;
}) {
  const response = await fetch("/api/compare", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    let message = "Vote failed.";
    try {
      const body: unknown = await response.json();
      if (body && typeof body === "object" && "error" in body && typeof body.error === "string") {
        message = (body as { error: string }).error;
      }
    } catch {
      /* ignore */
    }
    const err = new Error(message) as Error & { status?: number };
    err.status = response.status;
    throw err;
  }
}

/**
 * The salon: two works, one question. Votes are signed messages (no gas) and the
 * ranking they build is the "most beautiful" room of the gallery.
 */
export function CompareExperience() {
  const queryClient = useQueryClient();
  const { address, canTransact, isConnected, isReady } = useWalletStatus();
  const { openConnectModal } = useWalletUi();
  const signMessage = useSignMessage();
  const [relaxedVoter, setRelaxedVoter] = useState<string | null>(null);
  const [judged, setJudged] = useState(0);
  const voter = isConnected && address ? address : undefined;
  const relaxPairFilter = voter !== undefined && relaxedVoter === voter;

  const pairQuery = useQuery({
    queryKey: ["compare-pair", voter ?? "", isConnected, relaxPairFilter],
    queryFn: () =>
      getComparePair({
        ...(voter ? { voter } : {}),
        skipPairFilter: relaxPairFilter
      }),
    // Each pair ships a one-time signing nonce; a cached pair would sign with a spent nonce.
    staleTime: 0,
    gcTime: 0
  });

  const voteMutation = useMutation({
    mutationFn: async ({
      firstId,
      secondId,
      winner,
      signNonce
    }: {
      firstId: number;
      secondId: number;
      winner: number;
      signNonce: string;
    }) => {
      if (!canTransact) {
        throw new Error(`Connect your wallet on ${getChainDisplayName()} to vote.`);
      }

      const chainId = getConfiguredEvmChain().id;
      const message = buildBeautyVoteMessage({
        chainId,
        signNonce,
        nft1: firstId,
        nft2: secondId,
        winner
      });
      const signature = await signMessage.mutateAsync({ message });
      await submitVote({
        firstId,
        secondId,
        winner,
        signNonce,
        signature,
        chainId
      });
    },
    onSuccess: async () => {
      setJudged((count) => count + 1);
      trackEvent("beauty_vote", { judged: judged + 1 });
      toast.success("Vote recorded. Next pair.");
      setRelaxedVoter(null);
      await queryClient.invalidateQueries({ queryKey: ["compare-pair"] });
    },
    onError: async (e: Error & { status?: number }) => {
      if (e.status === 409) {
        toast.info("You already voted on this pair. Loading another…");
        await queryClient.invalidateQueries({ queryKey: ["compare-pair"] });
        return;
      }
      showWalletError(e);
    }
  });

  const pair = pairQuery.data;
  const [firstId, secondId] = pair?.tokenIds ?? [];
  const pairExhausted = pair?.pairExhausted === true;
  const votingBlocked = pairExhausted && isConnected;
  const busy = voteMutation.isPending || pairQuery.isFetching;

  function pick(winner: number) {
    if (!pair || firstId === undefined || secondId === undefined) return;
    if (!isConnected) {
      trackEvent("wallet_connect_attempt", { mode: "salon" });
      openConnectModal();
      return;
    }
    if (!canTransact || votingBlocked || busy) return;
    voteMutation.mutate({ firstId, secondId, winner, signNonce: pair.signNonce });
  }

  // ← picks the left work, → the right one; S skips the pair.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const typing =
        event.target instanceof Element && event.target.closest("input, textarea, select, [role=dialog]") !== null;
      if (typing || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "ArrowLeft" && firstId !== undefined) pick(firstId);
      else if (event.key === "ArrowRight" && secondId !== undefined) pick(secondId);
      else if ((event.key === "s" || event.key === "S") && !busy) void pairQuery.refetch();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  return (
    <div className="space-y-10" data-testid="salon">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3">
          <p className="eyebrow text-accent">The salon</p>
          <h1 className="font-display text-5xl leading-none sm:text-6xl">Which is more beautiful?</h1>
          <p className="max-w-xl text-pretty text-base leading-7 text-muted-foreground">
            Two works, one question. Your answer is a signed message — no gas, no transaction — and every answer moves
            the collection&apos;s beauty ranking.
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-x-8 font-mono text-xs sm:text-right" data-testid="salon-tally">
          <dt className="eyebrow row-start-2">Votes cast</dt>
          <dd className="row-start-1 text-lg tabular-nums text-foreground">
            {pair ? pair.totalCount.toLocaleString() : "—"}
          </dd>
          <dt className="eyebrow row-start-2">Your session</dt>
          <dd className="row-start-1 text-lg tabular-nums text-foreground">{judged}</dd>
        </dl>
      </div>

      {isConnected && !isReady ? (
        <WalletStatusCard
          disconnectedTitle="Wallet required"
          disconnectedBody={`Connect a wallet on ${getChainDisplayName()} to vote.`}
          wrongNetworkBody={`Switch to ${getChainDisplayName()} before signing your vote.`}
        />
      ) : null}

      {votingBlocked ? (
        <div className="space-y-3 rounded-md border border-border p-4 text-sm">
          <p className="text-muted-foreground">
            We couldn&apos;t find a pair you haven&apos;t voted on yet (after many random draws). You can load a random
            pair anyway — voting will fail if you already chose between these two.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pairQuery.isFetching}
            onClick={() => setRelaxedVoter(voter ?? null)}
          >
            {pairQuery.isFetching ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : null}
            Show random pair anyway
          </Button>
        </div>
      ) : null}

      {pairQuery.isPending || firstId === undefined || secondId === undefined ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-center" aria-busy>
          <Skeleton className="aspect-[1.6/1] w-full" />
          <span className="eyebrow text-center">or</span>
          <Skeleton className="aspect-[1.6/1] w-full" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-center" data-testid="salon-pair">
          {[firstId, secondId].map((id, index) => (
            <div key={id} className={cn("space-y-3", busy && "opacity-70")}>
              <NftCard id={id} href={`/detail/${id}`} />
              <Button
                className="w-full"
                size="lg"
                variant={index === 0 ? "default" : "outline"}
                disabled={(isConnected && !canTransact) || votingBlocked || busy}
                onClick={() => pick(id)}
                data-testid={`pick-${index === 0 ? "left" : "right"}`}
              >
                {voteMutation.isPending && voteMutation.variables?.winner === id ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
                ) : null}
                Pick {id}
                <span className="sr-only"> ({formatId(id)})</span>
                <kbd className="ml-2 hidden rounded-sm border border-current/30 px-1.5 font-mono text-[0.6rem] opacity-60 sm:inline">
                  {index === 0 ? "←" : "→"}
                </kbd>
              </Button>
            </div>
          ))}
          <span className="eyebrow order-first text-center lg:order-none">or</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
        <p className="text-xs leading-6 text-muted-foreground">
          {isConnected
            ? "Signing is free: your wallet signs a short message naming the pair and your choice; nothing is sent on-chain."
            : "Connect a wallet to vote. You will sign a short message — no gas, no transaction."}
        </p>
        <Button
          variant="ghost"
          size="sm"
          disabled={busy}
          onClick={() => void pairQuery.refetch()}
          data-testid="skip-pair"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden />
          Skip this pair
          <kbd className="ml-1 hidden font-mono text-[0.6rem] opacity-60 sm:inline">S</kbd>
        </Button>
      </div>
    </div>
  );
}
