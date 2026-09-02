import type { Nft } from "@/lib/types";
import { formatId } from "@/lib/utils";

const CC0_LICENSE_URL = "https://creativecommons.org/publicdomain/zero/1.0/";

export function tokenTitle(nft: Nft): string {
  return nft.name ? `${formatId(nft.id)} “${nft.name}”` : `NFT ${formatId(nft.id)}`;
}

/** Unique, fact-dense description per token so 4,000+ pages don't cluster as duplicates. */
export function tokenDescription(nft: Nft): string {
  if (nft.isPendingMetadata) {
    return `Random Walk NFT ${formatId(nft.id)} was just minted on Arbitrum. Its unique artwork — one still and two films from seed ${nft.seed.slice(0, 10)}… — is being generated now.`;
  }
  const mintedPart = nft.mintedAt ? ` Minted ${nft.mintedAt.slice(0, 10)}.` : "";
  const namePart = nft.name ? ` Named “${nft.name}” by its owner.` : "";
  return `Random Walk NFT ${formatId(nft.id)} — a CC0 generative artwork on Arbitrum drawn from on-chain seed ${nft.seed.slice(0, 10)}….${mintedPart}${namePart} View the still image, two films, provenance, and ownership history.`;
}

type ArtworkJsonLdInput = {
  nft: Nft;
  siteName: string;
  siteUrl: string;
  contractAddress: string;
  beautyRank: number | undefined;
};

/** schema.org VisualArtwork for a token page, with films attached once they exist. */
export function tokenJsonLd({ nft, siteName, siteUrl, contractAddress, beautyRank }: ArtworkJsonLdInput) {
  const pageUrl = `${siteUrl}/detail/${nft.id}`;
  const displayName = nft.name || `Random Walk NFT ${formatId(nft.id)}`;
  return {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    name: displayName,
    alternateName: `Random Walk NFT ${formatId(nft.id)}`,
    artform: "Generative art",
    artMedium: "Algorithmic drawing (random walk from an on-chain seed)",
    description: tokenDescription(nft),
    url: pageUrl,
    license: CC0_LICENSE_URL,
    creator: { "@type": "Organization", name: siteName, url: siteUrl },
    ...(nft.mintedAt ? { dateCreated: nft.mintedAt } : {}),
    isPartOf: { "@type": "Collection", name: siteName, url: `${siteUrl}/gallery` },
    identifier: [
      { "@type": "PropertyValue", name: "Token ID", value: String(nft.id) },
      { "@type": "PropertyValue", name: "Contract address (Arbitrum)", value: contractAddress },
      { "@type": "PropertyValue", name: "On-chain seed", value: nft.seed },
      ...(beautyRank ? [{ "@type": "PropertyValue", name: "Beauty rank", value: String(beautyRank) }] : [])
    ],
    image: {
      "@type": "ImageObject",
      contentUrl: nft.assets.blackImage,
      thumbnailUrl: nft.assets.blackThumb,
      license: CC0_LICENSE_URL,
      acquireLicensePage: pageUrl,
      creditText: `${siteName} ${formatId(nft.id)} (CC0)`
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
              ...(nft.mintedAt ? { uploadDate: nft.mintedAt } : {})
            },
            {
              "@type": "VideoObject",
              name: `${displayName} — triple walker film`,
              description: `Motion rendering of Random Walk NFT ${formatId(nft.id)}: three walkers draw the artwork simultaneously.`,
              contentUrl: nft.assets.blackTripleVideo,
              thumbnailUrl: nft.assets.blackThumb,
              ...(nft.mintedAt ? { uploadDate: nft.mintedAt } : {})
            }
          ]
        })
  };
}
