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
import { PAGE_SIZE } from "@/lib/config";
import { getAppConfig } from "@/lib/server/app-config";
import { getDescendingTokenPage, paginateItems } from "@/lib/pagination";
import { buildCollectionSearchParams, parseCollectionQueryState } from "@/lib/query-state";
import { createAssetUrls, shortenAddress } from "@/lib/utils";
import { getPublicClient } from "@/lib/web3/public-client";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const GALLERY_DESCRIPTION =
  "Browse the full Random Walk NFT collection. Sort by newest or community beauty score and explore generative art on Arbitrum.";

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const state = parseCollectionQueryState(await searchParams);

  // Wallet-filtered and search-result views: keep them out of the index to
  // avoid crawl bloat (thousands of owner/query permutations).
  if (state.address || state.query !== undefined) {
    return {
      title: "Gallery",
      description: GALLERY_DESCRIPTION,
      robots: { index: false, follow: true },
      alternates: { canonical: "/gallery" }
    };
  }

  // Paginated and sorted views are real, distinct content: self-referencing canonicals.
  const params = new URLSearchParams();
  if (state.sortBy !== "tokenId") {
    params.set("sortBy", state.sortBy);
  }
  if (state.page > 1) {
    params.set("page", String(state.page));
  }
  const suffix = params.toString();
  const canonical = suffix ? `/gallery?${suffix}` : "/gallery";
  const pageSuffix = state.page > 1 ? ` — page ${state.page}` : "";

  return {
    title: `Gallery${pageSuffix}`,
    description: GALLERY_DESCRIPTION,
    alternates: { canonical },
    openGraph: {
      title: `Gallery${pageSuffix} | Random Walk NFT`,
      description: GALLERY_DESCRIPTION
    }
  };
}

export default async function GalleryPage({ searchParams }: { searchParams: SearchParams }) {
  const { NFT_ADDRESS, SITE_DESCRIPTION, SITE_NAME, SITE_URL } = await getAppConfig();
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
    const walletTokens = (await getPublicClient().readContract({
      address: NFT_ADDRESS,
      abi: nftAbi,
      functionName: "walletOfOwner",
      args: [address as `0x${string}`]
    })) as bigint[];
    tokenIds = walletTokens.map((tokenId) => Number(tokenId));
  } else {
    totalSupply = Number(
      await getPublicClient().readContract({
        address: NFT_ADDRESS,
        abi: nftAbi,
        functionName: "totalSupply"
      })
    );
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
      tokenIds = [];
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
    <PageShell className="space-y-8 py-12">
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
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Collection" }]} />
      <div className="flex flex-wrap items-end justify-between gap-6">
        <PageHeading
          eyebrow={address ? "A collector's wall" : "The collection"}
          title={
            address
              ? `Works held by ${shortenAddress(address, 6)}`
              : sortBy === "beauty"
                ? "The most beautiful, as voted."
                : "Every walk, newest first."
          }
          description={
            address
              ? `${pageData.totalItems.toLocaleString()} Random Walk NFT${pageData.totalItems === 1 ? "" : "s"} in this wallet.`
              : sortBy === "beauty"
                ? "Visitors compare works two at a time in the salon; every vote moves this ranking."
                : `${totalSupply.toLocaleString()} works drawn by chance since 2021. Hover any frame to watch it move; switch wings to see its other edition.`
          }
        />
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground" data-testid="gallery-count">
          {pageData.totalItems.toLocaleString()} works · Page {pageData.page} of {pageData.totalPages}
        </p>
      </div>

      <CollectionToolbar state={state} />

      <NftGrid
        ids={pageData.items}
        view={view}
        emptyMessage={address ? "No works in this wallet yet." : "No work with that number."}
        emptyDescription={
          address
            ? "Mint one and it will hang here within minutes."
            : `Token numbers run from #000000 to #${String(Math.max(0, totalSupply - 1)).padStart(6, "0")}.`
        }
        rankOffset={
          sortBy === "beauty" && !address && query === undefined ? (pageData.page - 1) * PAGE_SIZE : undefined
        }
      />
      <Pager pathname="/gallery" page={pageData.page} totalPages={pageData.totalPages} searchParams={pagerParams} />
    </PageShell>
  );
}
