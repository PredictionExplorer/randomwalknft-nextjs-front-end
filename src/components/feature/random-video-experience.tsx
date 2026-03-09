"use client";

import Link from "next/link";
import type { Route } from "next";
import { useQuery } from "@tanstack/react-query";

import { Skeleton } from "@/components/ui/skeleton";
import { createAssetUrls, formatId } from "@/lib/utils";

async function getRandomToken() {
  const response = await fetch("/api/random-token");
  if (!response.ok) {
    throw new Error("Failed to load a random token.");
  }

  const data = (await response.json()) as { tokenIds: number[] };
  return data.tokenIds[0];
}

export function RandomVideoExperience() {
  const { data: tokenId, isPending, refetch } = useQuery({
    queryKey: ["random-video"],
    queryFn: getRandomToken
  });

  if (isPending || !tokenId) {
    return <Skeleton className="min-h-[calc(100vh-12rem)] w-full rounded-none" />;
  }

  const assets = createAssetUrls(tokenId);

  return (
    <div className="relative min-h-[calc(100vh-12rem)]">
      <div className="absolute inset-0 overflow-hidden">
        <video
          autoPlay
          muted
          playsInline
          className="absolute left-1/2 top-1/2 h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover"
          onEnded={() => void refetch()}
        >
          <source src={assets.blackSingleVideo} type="video/mp4" />
        </video>
      </div>

      <div className="absolute inset-x-0 bottom-10 flex justify-center">
        <Link href={`/detail/${tokenId}` as Route} className="rounded-full border border-border bg-background/75 px-5 py-3 text-sm tracking-[0.2em] text-secondary backdrop-blur">
          {formatId(tokenId)}
        </Link>
      </div>
    </div>
  );
}
