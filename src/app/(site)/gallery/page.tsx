import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { JsonLd } from "@/components/common/json-ld";
import { PageHeading } from "@/components/common/page-heading";
import { PageShell } from "@/components/common/page-shell";
import { Pager } from "@/components/common/pager";
import { CollectionToolbar } from "@/components/collection/collection-toolbar";
import { NftGrid } from "@/components/nft/nft-grid";
import { nftAbi } from "@/generated/wagmi";
import { getRatingOrder } from "@/lib/api/public";
import { NFT_ADDRESS, PAGE_SIZE, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/config";
import { getDescendingTokenPage, paginateItems } from "@/lib/pagination";
import { buildCollectionSearchParams, parseCollectionQueryState } from "@/lib/query-state";
import { createAssetUrls } from "@/lib/utils";
import { publicClient } from "@/lib/web3/public-client";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Browse the full Random Walk NFT collection. Sort by newest or community beauty score and explore generative art on Arbitrum.",
  alternates: { canonical: "/gallery" },
  openGraph: {
    title: "Gallery | Random Walk NFT",
    description:
      "Browse the full Random Walk NFT collection. Sort by newest or community beauty score and explore generative art on Arbitrum."
  }
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function GalleryPage({ searchParams }: { searchParams: SearchParams }) {
  const resolvedSearchParams = await searchParams;
  const state = parseCollectionQueryState(resolvedSearchParams);
  const { address, sortBy, query, page: requestedPage, view } = state;

  let tokenIds: number[] = [];
  let totalSupply = 0;
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
    totalSupply = Number((await publicClient.readContract({
      address: NFT_ADDRESS,
      abi: nftAbi,
      functionName: "totalSupply"
    })) as bigint);
    if (sortBy === "tokenId" && query === undefined) {
      pageData = getDescendingTokenPage(totalSupply, requestedPage, PAGE_SIZE);
    } else {
      tokenIds = Array.from({ length: totalSupply }, (_, index) => index).reverse();
    }
  }

  if (sortBy === "beauty") {
    const ratingOrder = await getRatingOrder();
    tokenIds = address ? ratingOrder.filter((id) => tokenIds.includes(id)).reverse() : [...ratingOrder].reverse();
  } else if (address) {
    tokenIds.sort((left, right) => right - left);
  }

  if (query !== undefined) {
    if (!address && sortBy === "tokenId") {
      pageData = {
        items: query < totalSupply ? [query] : [],
        totalItems: query < totalSupply ? 1 : 0,
        totalPages: 1,
        page: 1
      };
    } else if (pageData.items.length) {
      pageData = {
        items: pageData.items.includes(query) ? [query] : [],
        totalItems: pageData.items.includes(query) ? 1 : 0,
        totalPages: 1,
        page: 1
      };
    } else {
      tokenIds = tokenIds.filter((id) => id === query);
    }
  }

  if (tokenIds.length) {
    pageData = paginateItems(tokenIds, requestedPage, PAGE_SIZE);
  }

  const pagerParams = buildCollectionSearchParams({
    ...state,
    page: 1
  });

  return (
    <PageShell className="space-y-8 py-16">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${SITE_NAME} Gallery`,
          description: SITE_DESCRIPTION,
          url: `${SITE_URL}/gallery`,
          isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: pageData.totalItems,
            itemListElement: pageData.items.slice(0, 12).map((id, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: `${SITE_URL}/detail/${id}`,
              name: `Random Walk NFT #${String(id).padStart(6, "0")}`,
              image: createAssetUrls(id).blackThumb
            }))
          }
        }}
      />
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { label: "Collection" }
        ]}
      />
      <PageHeading
        eyebrow="Full collection"
        title={[
          { text: "RANDOM" },
          { text: "WALK", tone: "primary" },
          { text: "NFT", tone: "secondary" },
          { text: "GALLERY" }
        ]}
        description={address ? `Showing NFTs owned by ${address.slice(0, 8)}...${address.slice(-4)}` : "Browse every Random Walk NFT — sort by newest or community beauty score."}
      />

      <CollectionToolbar state={state} />

      <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
        <span>{pageData.totalItems.toLocaleString()} NFTs</span>
        <span>
          Page {pageData.page} of {pageData.totalPages}
        </span>
      </div>

      {(state.query !== undefined || state.sortBy !== "tokenId" || state.view !== "gallery" || state.address) ? (
        <div className="flex flex-wrap gap-2">
          {state.address ? (
            <span className="rounded-full border border-border/80 px-3 py-1 text-xs text-muted-foreground">
              Wallet view
            </span>
          ) : null}
          {state.query !== undefined ? (
            <span className="rounded-full border border-border/80 px-3 py-1 text-xs text-muted-foreground">
              Token #{state.query.toString().padStart(6, "0")}
            </span>
          ) : null}
          {state.sortBy === "beauty" ? (
            <span className="rounded-full border border-border/80 px-3 py-1 text-xs text-muted-foreground">
              Sorted by beauty
            </span>
          ) : null}
          {state.view === "compact" ? (
            <span className="rounded-full border border-border/80 px-3 py-1 text-xs text-muted-foreground">
              Compact layout
            </span>
          ) : null}
        </div>
      ) : null}

      <NftGrid ids={pageData.items} view={view} emptyMessage="No NFTs found for this wallet." />
      <Pager pathname="/gallery" page={pageData.page} totalPages={pageData.totalPages} searchParams={pagerParams} />
    </PageShell>
  );
}
