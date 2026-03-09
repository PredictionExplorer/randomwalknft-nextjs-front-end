import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/common/json-ld";
import { NftDetailExperience } from "@/components/feature/nft-detail-experience";
import { getOffersForToken, getTokenDetail } from "@/lib/api/public";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/config";
import type { AssetTheme, AssetVariant, Offer } from "@/lib/types";
import { formatId } from "@/lib/utils";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const tokenId = Number(id);

  if (!Number.isFinite(tokenId)) {
    return { title: "NFT Detail" };
  }

  try {
    const nft = await getTokenDetail(tokenId);
    return {
      title: `NFT ${formatId(nft.id)}`,
      description: `${SITE_DESCRIPTION} Details for ${formatId(nft.id)}.`,
      openGraph: {
        images: [nft.assets.blackThumb]
      },
      twitter: {
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
  const [{ id }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const tokenId = Number(id);

  if (!Number.isInteger(tokenId) || tokenId < 0) {
    notFound();
  }

  const nft = await getTokenDetail(tokenId).catch(() => null);
  if (!nft) {
    notFound();
  }
  const offers = await getOffersForToken(tokenId).catch(() => ({
    buyOffers: [] as Offer[],
    sellOffers: [] as Offer[]
  }));

  const message = typeof resolvedSearchParams.message === "string" ? resolvedSearchParams.message : undefined;
  const initialTheme: AssetTheme =
    resolvedSearchParams.theme === "white" ? "white" : "black";
  const initialMedia: AssetVariant =
    resolvedSearchParams.media === "singleVideo" || resolvedSearchParams.media === "tripleVideo"
      ? resolvedSearchParams.media
      : "image";

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: nft.name || formatId(nft.id),
          description: `${SITE_DESCRIPTION} Details for ${formatId(nft.id)}.`,
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
