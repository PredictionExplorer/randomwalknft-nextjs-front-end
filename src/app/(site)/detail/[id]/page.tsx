import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/common/json-ld";
import { NftDetailExperience } from "@/components/feature/nft-detail-experience";
import { getOffersForToken, getTokenDetailOrFallback } from "@/lib/api/public";
import { getBaseConfig } from "@/lib/config";
import type { AssetTheme, AssetVariant, Offer } from "@/lib/types";
import { formatId } from "@/lib/utils";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { SITE_NAME } = getBaseConfig();
  const { id } = await params;
  const tokenId = Number(id);

  if (!Number.isFinite(tokenId)) {
    return { title: "NFT Detail" };
  }

  try {
    const nft = await getTokenDetailOrFallback(tokenId);
    if (!nft) {
      return { title: "NFT Detail" };
    }

    return {
      title: `NFT ${formatId(nft.id)}`,
      description: nft.isPendingMetadata
        ? `Random Walk NFT ${formatId(nft.id)} was just minted on Arbitrum. Metadata and media are still processing.`
        : `Random Walk NFT ${formatId(nft.id)} — a unique generative artwork on Arbitrum created from an on-chain seed. View, trade, and explore its history.`,
      alternates: { canonical: `/detail/${nft.id}` },
      openGraph: {
        title: `NFT ${formatId(nft.id)} | ${SITE_NAME}`,
        description: nft.isPendingMetadata
          ? `Random Walk NFT ${formatId(nft.id)} was just minted on Arbitrum. Metadata and media are still processing.`
          : `Random Walk NFT ${formatId(nft.id)} — a unique generative artwork on Arbitrum created from an on-chain seed.`,
        images: [nft.assets.blackThumb]
      },
      twitter: {
        title: `NFT ${formatId(nft.id)} | ${SITE_NAME}`,
        images: [nft.assets.blackThumb]
      }
    };
  } catch {
    return {
      title: "NFT Detail"
    };
  }
}

export default async function DetailPage({
  params,
  searchParams
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { SITE_DESCRIPTION, SITE_NAME, SITE_URL } = getBaseConfig();
  const [{ id }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const tokenId = Number(id);
  const message = typeof resolvedSearchParams.message === "string" ? resolvedSearchParams.message : undefined;

  if (!Number.isInteger(tokenId) || tokenId < 0) {
    notFound();
  }

  const nft = await getTokenDetailOrFallback(tokenId, { fresh: true });
  if (!nft) {
    notFound();
  }
  const offers = await getOffersForToken(tokenId).catch(() => ({
    buyOffers: [] as Offer[],
    sellOffers: [] as Offer[]
  }));

  const initialTheme: AssetTheme =
    resolvedSearchParams.theme === "white" ? "white" : "black";
  const initialMedia: AssetVariant =
    !nft.isPendingMetadata &&
      (resolvedSearchParams.media === "singleVideo" || resolvedSearchParams.media === "tripleVideo")
      ? resolvedSearchParams.media
      : "image";

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: nft.name || formatId(nft.id),
          description: nft.isPendingMetadata
            ? `Random Walk NFT ${formatId(nft.id)} was minted on-chain and is still processing metadata and media.`
            : `${SITE_DESCRIPTION} Details for ${formatId(nft.id)}.`,
          image: nft.assets.blackThumb,
          url: `${SITE_URL}/detail/${nft.id}`,
          creator: { "@type": "Organization", name: SITE_NAME },
          dateCreated: nft.mintedAt
        }}
      />
      <NftDetailExperience
        nft={nft}
        buyOffers={offers.buyOffers}
        sellOffers={offers.sellOffers}
        message={message}
        initialTheme={initialTheme}
        initialMedia={initialMedia}
      />
    </>
  );
}
