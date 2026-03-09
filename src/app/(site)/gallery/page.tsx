import type { Metadata } from "next";

import { PageHeading } from "@/components/common/page-heading";
import { PageShell } from "@/components/common/page-shell";
import { Pager } from "@/components/common/pager";
import { NftGrid } from "@/components/nft/nft-grid";
import { Button } from "@/components/ui/button";
import { nftAbi } from "@/generated/wagmi";
import { getRatingOrder } from "@/lib/api/public";
import { NFT_ADDRESS, PAGE_SIZE } from "@/lib/config";
import { getDescendingTokenPage, paginateItems } from "@/lib/pagination";
import { publicClient } from "@/lib/web3/public-client";

export const metadata: Metadata = {
  title: "Gallery"
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function GalleryPage({ searchParams }: { searchParams: SearchParams }) {
  const resolvedSearchParams = await searchParams;
  const address = typeof resolvedSearchParams.address === "string" ? resolvedSearchParams.address : undefined;
  const sortBy = resolvedSearchParams.sortBy === "beauty" ? "beauty" : "tokenId";
  const requestedPage =
    typeof resolvedSearchParams.page === "string" ? Number(resolvedSearchParams.page) : 1;

  let tokenIds: number[] = [];
  let pageData = {
    items: [] as number[],
    totalItems: 0,
    totalPages: 1,
    page: 1
  };
  if (address) {
    const walletTokens = (await publicClient.readContract({
      address: NFT_ADDRESS,
      abi: nftAbi,
      functionName: "walletOfOwner",
      args: [address as `0x${string}`]
    })) as bigint[];
    tokenIds = walletTokens.map((tokenId) => Number(tokenId));
  } else {
    const totalSupply = (await publicClient.readContract({
      address: NFT_ADDRESS,
      abi: nftAbi,
      functionName: "totalSupply"
    })) as bigint;
    if (sortBy === "tokenId") {
      pageData = getDescendingTokenPage(Number(totalSupply), requestedPage, PAGE_SIZE);
    } else {
      tokenIds = Array.from({ length: Number(totalSupply) }, (_, index) => index).reverse();
    }
  }

  if (sortBy === "beauty") {
    const ratingOrder = await getRatingOrder();
    tokenIds = address ? ratingOrder.filter((id) => tokenIds.includes(id)).reverse() : [...ratingOrder].reverse();
  } else if (address) {
    tokenIds.sort((left, right) => right - left);
  }

  if (tokenIds.length) {
    pageData = paginateItems(tokenIds, requestedPage, PAGE_SIZE);
  }

  const pagerParams = new URLSearchParams();
  if (address) {
    pagerParams.set("address", address);
  }
  if (sortBy !== "tokenId") {
    pagerParams.set("sortBy", sortBy);
  }

  return (
    <PageShell className="space-y-8 py-16">
      <PageHeading
        title={[
          { text: "RANDOM" },
          { text: "WALK", tone: "primary" },
          { text: "NFT", tone: "secondary" },
          { text: "GALLERY" }
        ]}
        description={address ? `Owned by ${address}` : "Browse the full Random Walk NFT collection."}
      />

      <div className="flex flex-wrap gap-3">
        <Button asChild variant={sortBy === "tokenId" ? "default" : "outline"} size="sm">
          <a href={address ? `/gallery?address=${address}` : "/gallery"}>Sort by Token ID</a>
        </Button>
        <Button asChild variant={sortBy === "beauty" ? "default" : "outline"} size="sm">
          <a href={address ? `/gallery?address=${address}&sortBy=beauty` : "/gallery?sortBy=beauty"}>Sort by Beauty</a>
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
        <span>{pageData.totalItems.toLocaleString()} NFTs</span>
        <span>
          Page {pageData.page} of {pageData.totalPages}
        </span>
      </div>

      <NftGrid ids={pageData.items} emptyMessage="No NFTs found for this wallet." />
      <Pager pathname="/gallery" page={pageData.page} totalPages={pageData.totalPages} searchParams={pagerParams} />
    </PageShell>
  );
}
