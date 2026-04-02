"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { useAccount, useSignMessage } from "wagmi";
import { z } from "zod";

import { PageHeading } from "@/components/common/page-heading";
import { NftCard } from "@/components/nft/nft-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageShell } from "@/components/common/page-shell";
import { buildBeautyVoteMessage } from "@/lib/web3/beauty-vote-message";
import { getConfiguredEvmChain } from "@/lib/web3/evm-chain";
import { createAssetUrls } from "@/lib/utils";

const compareResponseSchema = z.object({
  tokenIds: z.array(z.number()),
  totalCount: z.number(),
  signNonce: z.string().min(1),
  pairExhausted: z.boolean().optional()
});

type CompareResponse = z.infer<typeof compareResponseSchema>;

async function getComparePair(opts: {
  voter?: string;
  skipPairFilter?: boolean;
}): Promise<CompareResponse> {
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
      if (body && typeof body === "object" && "error" in body && typeof (body as { error: unknown }).error === "string") {
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

export function CompareExperience() {
  const queryClient = useQueryClient();
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [relaxPairFilter, setRelaxPairFilter] = useState(false);

  useEffect(() => {
    setRelaxPairFilter(false);
  }, [address]);

  const pairQuery = useQuery({
    queryKey: ["compare-pair", address ?? "", isConnected, relaxPairFilter],
    queryFn: () =>
      getComparePair({
        voter: isConnected && address ? address : undefined,
        skipPairFilter: relaxPairFilter
      })
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
      const chainId = getConfiguredEvmChain().id;
      const message = buildBeautyVoteMessage({
        chainId,
        signNonce,
        nft1: firstId,
        nft2: secondId,
        winner
      });
      const signature = await signMessageAsync({ message });
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
      toast.success("Vote submitted.");
      setRelaxPairFilter(false);
      await queryClient.invalidateQueries({ queryKey: ["compare-pair"] });
    },
    onError: async (e: Error & { status?: number }) => {
      if (e.status === 409) {
        toast.info("You already voted on this pair. Loading another…");
        await queryClient.invalidateQueries({ queryKey: ["compare-pair"] });
        return;
      }
      toast.error(e.message || "Could not submit the vote.");
    }
  });

  if (pairQuery.isPending || !pairQuery.data) {
    return (
      <PageShell className="space-y-8 py-16">
        <PageHeading
          title={[
            { text: "WHICH" },
            { text: "NFT", tone: "primary" },
            { text: "IS MORE BEAUTIFUL?" }
          ]}
        />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </PageShell>
    );
  }

  const [firstId, secondId] = pairQuery.data.tokenIds;
  if (firstId === undefined || secondId === undefined) {
    return null;
  }

  const pairExhausted = pairQuery.data.pairExhausted === true;
  const votingBlocked = pairExhausted && isConnected;

  return (
    <PageShell className="space-y-8 py-16">
      <PageHeading
        title={[
          { text: "WHICH" },
          { text: "NFT", tone: "primary" },
          { text: "IS MORE BEAUTIFUL?" }
        ]}
      />

      <Badge variant="secondary">{pairQuery.data.totalCount} votes</Badge>

      {!isConnected || !address ? (
        <p className="text-muted-foreground text-sm">
          Connect your wallet to vote. You will be asked to sign a short message (no gas).
        </p>
      ) : null}

      {votingBlocked ? (
        <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-4 text-sm">
          <p className="text-muted-foreground">
            We couldn&apos;t find a pair you haven&apos;t voted on yet (after many random draws). You can load a
            random pair anyway — voting will fail if you already chose between these two.
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={pairQuery.isFetching}
            onClick={() => setRelaxPairFilter(true)}
          >
            {pairQuery.isFetching ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            Show random pair anyway
          </Button>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        {[firstId, secondId].map((id) => (
          <div key={id} className="space-y-4">
            <NftCard id={id} image={createAssetUrls(id).blackThumb} href={`/detail/${id}`} />
            <Button
              className="w-full"
              disabled={voteMutation.isPending || !isConnected || votingBlocked}
              onClick={() =>
                voteMutation.mutate({
                  firstId,
                  secondId,
                  winner: id,
                  signNonce: pairQuery.data.signNonce
                })
              }
            >
              {voteMutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              Pick {id}
            </Button>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
