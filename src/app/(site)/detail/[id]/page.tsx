import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/common/json-ld";
import { NftDetailExperience } from "@/components/feature/nft-detail-experience";
import { getTokenDetailOrFallback } from "@/lib/api/public";
import { getBaseConfig } from "@/lib/config";
import { getAppConfig } from "@/lib/server/app-config";
import type { AssetTheme, AssetVariant, Nft } from "@/lib/types";
import { formatId } from "@/lib/utils";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const CC0_LICENSE_URL = "https://creativecommons.org/publicdomain/zero/1.0/";

function tokenTitle(nft: Nft): string {
  return nft.name ? `${formatId(nft.id)} “${nft.name}”` : `NFT ${formatId(nft.id)}`;
}

/** Unique, fact-dense description per token so 4,000+ pages don't cluster as duplicates. */
function tokenDescription(nft: Nft): string {
  if (nft.isPendingMetadata) {
    return `Random Walk NFT ${formatId(nft.id)} was just minted on Arbitrum. Its unique artwork — one still and two films from seed ${nft.seed.slice(0, 10)}… — is being generated now.`;
  }
  const mintedPart = nft.mintedAt ? ` Minted ${nft.mintedAt.slice(0, 10)}.` : "";
  const namePart = nft.name ? ` Named “${nft.name}” by its owner.` : "";
  return `Random Walk NFT ${formatId(nft.id)} — a CC0 generative artwork on Arbitrum drawn from on-chain seed ${nft.seed.slice(0, 10)}….${mintedPart}${namePart} View the still image, two films, provenance, and ownership history.`;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { SITE_NAME } = getBaseConfig();
  const { id } = await params;
  const tokenId = Number(id);

  if (!Number.isFinite(tokenId)) {
    return { title: "NFT Detail", robots: { index: false, follow: false } };
  }

  try {
    const nft = await getTokenDetailOrFallback(tokenId);
    if (!nft) {
      // Data temporarily unavailable: keep a self-canonical so this page never
      // declares itself a duplicate of the homepage, and skip indexing for now.
      return {
        title: `NFT ${formatId(tokenId)}`,
        alternates: { canonical: `/detail/${tokenId}` },
        robots: { index: false, follow: true }
      };
    }

    const description = tokenDescription(nft);
    // The composed share card comes from the sibling opengraph-image.tsx file
    // convention; Twitter falls back to og:image, so no images are set here.
    return {
      title: tokenTitle(nft),
      description,
      alternates: { canonical: `/detail/${nft.id}` },
      openGraph: {
        title: `${tokenTitle(nft)} | ${SITE_NAME}`,
        description
      },
      twitter: {
        card: "summary_large_image",
        title: `${tokenTitle(nft)} | ${SITE_NAME}`
      }
    };
  } catch {
    return {
      title: `NFT ${formatId(tokenId)}`,
      alternates: { canonical: `/detail/${tokenId}` },
      robots: { index: false, follow: true }
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
  const { SITE_NAME, SITE_URL } = getBaseConfig();
  const { NFT_ADDRESS } = await getAppConfig();
  const [{ id }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const tokenId = Number(id);
  const message = typeof resolvedSearchParams.message === "string" ? resolvedSearchParams.message : undefined;

  if (!Number.isInteger(tokenId) || tokenId < 0) {
    notFound();
  }

  // Fresh reads only right after a mint; otherwise the 5-minute fetch cache
  // keeps thousands of token pages fast for visitors and crawlers alike.
  const nft = await getTokenDetailOrFallback(tokenId, { fresh: message === "success" });
  if (!nft) {
    notFound();
  }
  const initialTheme: AssetTheme =
    resolvedSearchParams.theme === "white" ? "white" : "black";
  const initialMedia: AssetVariant =
    !nft.isPendingMetadata &&
      (resolvedSearchParams.media === "singleVideo" || resolvedSearchParams.media === "tripleVideo")
      ? resolvedSearchParams.media
      : "image";

  const pageUrl = `${SITE_URL}/detail/${nft.id}`;
  const displayName = nft.name || `Random Walk NFT ${formatId(nft.id)}`;
  const mintedDate = nft.mintedAt;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "VisualArtwork",
          name: displayName,
          alternateName: `Random Walk NFT ${formatId(nft.id)}`,
          artform: "Generative art",
          artMedium: "Algorithmic drawing (random walk from an on-chain seed)",
          description: tokenDescription(nft),
          url: pageUrl,
          license: CC0_LICENSE_URL,
          creator: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
          ...(mintedDate ? { dateCreated: mintedDate } : {}),
          isPartOf: {
            "@type": "Collection",
            name: SITE_NAME,
            url: `${SITE_URL}/gallery`
          },
          identifier: [
            { "@type": "PropertyValue", name: "Token ID", value: String(nft.id) },
            { "@type": "PropertyValue", name: "Contract address (Arbitrum)", value: NFT_ADDRESS },
            { "@type": "PropertyValue", name: "On-chain seed", value: nft.seed }
          ],
          image: {
            "@type": "ImageObject",
            contentUrl: nft.assets.blackImage,
            thumbnailUrl: nft.assets.blackThumb,
            license: CC0_LICENSE_URL,
            acquireLicensePage: pageUrl,
            creditText: `${SITE_NAME} ${formatId(nft.id)} (CC0)`
          },
          ...(nft.isPendingMetadata
            ? {}
            : {
                associatedMedia: [
                  {
                    "@type": "VideoObject",
                    name: `${displayName} — single walker film`,
                    description: `Motion rendering of Random Walk NFT ${formatId(nft.id)}: one walker draws the artwork point by point.`,
                    contentUrl: nft.assets.blackSingleVideo,
                    thumbnailUrl: nft.assets.blackThumb,
                    ...(mintedDate ? { uploadDate: mintedDate } : {})
                  },
                  {
                    "@type": "VideoObject",
                    name: `${displayName} — triple walker film`,
                    description: `Motion rendering of Random Walk NFT ${formatId(nft.id)}: three walkers draw the artwork simultaneously.`,
                    contentUrl: nft.assets.blackTripleVideo,
                    thumbnailUrl: nft.assets.blackThumb,
                    ...(mintedDate ? { uploadDate: mintedDate } : {})
                  }
                ]
              })
        }}
      />
      <NftDetailExperience
        nft={nft}
        message={message}
        initialTheme={initialTheme}
        initialMedia={initialMedia}
      />
    </>
  );
}
