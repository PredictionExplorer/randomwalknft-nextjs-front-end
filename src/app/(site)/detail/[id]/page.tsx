import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NftDetailExperience } from "@/components/feature/nft-detail-experience";
import { getOffersForToken, getTokenDetail } from "@/lib/api/public";
import { SITE_DESCRIPTION } from "@/lib/config";
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

  const [nft, offers] = await Promise.all([
    getTokenDetail(tokenId).catch(() => null),
    getOffersForToken(tokenId).catch(() => null)
  ]);
  if (!nft || !offers) {
    notFound();
  }

  const message = typeof resolvedSearchParams.message === "string" ? resolvedSearchParams.message : undefined;

  return (
    <NftDetailExperience
      nft={nft}
      buyOffers={offers.buyOffers}
      sellOffers={offers.sellOffers}
      message={message}
    />
  );
}
