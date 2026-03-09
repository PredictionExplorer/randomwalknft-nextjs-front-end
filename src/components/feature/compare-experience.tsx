"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { PageHeading } from "@/components/common/page-heading";
import { NftCard } from "@/components/nft/nft-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageShell } from "@/components/common/page-shell";
import { createAssetUrls } from "@/lib/utils";

const compareResponseSchema = z.object({
  tokenIds: z.array(z.number()),
  totalCount: z.number()
});

type CompareResponse = z.infer<typeof compareResponseSchema>;

async function getComparePair(): Promise<CompareResponse> {
  const response = await fetch("/api/compare");
  if (!response.ok) {
    throw new Error("Failed to fetch comparison pair.");
  }

  const data: unknown = await response.json();
  return compareResponseSchema.parse(data);
}

async function submitVote(firstId: number, secondId: number, winner: number) {
  const response = await fetch("/api/compare", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ firstId, secondId, winner })
  });

  if (!response.ok) {
    throw new Error("Vote failed.");
  }
}

export function CompareExperience() {
  const queryClient = useQueryClient();
  const pairQuery = useQuery({
    queryKey: ["compare-pair"],
    queryFn: getComparePair
  });

  const voteMutation = useMutation({
    mutationFn: ({ firstId, secondId, winner }: { firstId: number; secondId: number; winner: number }) =>
      submitVote(firstId, secondId, winner),
    onSuccess: async () => {
      toast.success("Vote submitted.");
      await queryClient.invalidateQueries({ queryKey: ["compare-pair"] });
    },
    onError: () => {
      toast.error("Could not submit the vote.");
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

      <div className="grid gap-6 lg:grid-cols-2">
        {[firstId, secondId].map((id) => (
          <div key={id} className="space-y-4">
            <NftCard id={id} image={createAssetUrls(id).blackThumb} href={`/detail/${id}`} />
            <Button
              className="w-full"
              disabled={voteMutation.isPending}
              onClick={() => voteMutation.mutate({ firstId, secondId, winner: id })}
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
