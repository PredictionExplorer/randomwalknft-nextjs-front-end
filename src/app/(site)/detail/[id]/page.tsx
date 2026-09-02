import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { JsonLd } from "@/components/common/json-ld";
import { PageShell } from "@/components/common/page-shell";
import { ArtworkStage } from "@/components/detail/artwork-stage";
import { CollectorTools } from "@/components/detail/collector-tools";
import { PendingRefresh } from "@/components/detail/pending-refresh";
import { Provenance } from "@/components/detail/provenance";
import { ShareActions } from "@/components/detail/share-actions";
import { TokenNav } from "@/components/detail/token-nav";
import { getRatingOrder, getTokenDetailOrFallback, getVaultState } from "@/lib/api/public";
import { getBaseConfig } from "@/lib/config";
import { getAppConfig } from "@/lib/server/app-config";
import type { AssetTheme, AssetVariant, Nft } from "@/lib/types";
import { formatDateFromUnix, formatId } from "@/lib/utils";
import { beautyRankOf } from "@/lib/walk/constellation";

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

export default async function DetailPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { SITE_NAME, SITE_URL } = getBaseConfig();
  const { NFT_ADDRESS } = await getAppConfig();
  const [{ id }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const tokenId = Number(id);
  const justMinted = resolvedSearchParams.message === "success";

  if (!Number.isInteger(tokenId) || tokenId < 0) {
    notFound();
  }

  // Fresh reads only right after a mint; otherwise the 5-minute fetch cache
  // keeps thousands of token pages fast for visitors and crawlers alike.
  const [nft, ratingOrder, vault] = await Promise.all([
    getTokenDetailOrFallback(tokenId, { fresh: justMinted }),
    getRatingOrder().catch(() => [] as number[]),
    getVaultState()
  ]);
  if (!nft) {
    notFound();
  }
  const pending = Boolean(nft.isPendingMetadata);
  const initialEdition: AssetTheme | undefined =
    resolvedSearchParams.theme === "white" ? "white" : resolvedSearchParams.theme === "black" ? "black" : undefined;
  const initialMedia: AssetVariant =
    !pending && (resolvedSearchParams.media === "singleVideo" || resolvedSearchParams.media === "tripleVideo")
      ? resolvedSearchParams.media
      : "image";
  const beautyRank = beautyRankOf(nft.id, ratingOrder);
  const totalSupply = Math.max(vault?.mintedCount ?? 0, tokenId + 1);
  const pageUrl = `${SITE_URL}/detail/${nft.id}`;
  const displayName = nft.name || `Random Walk NFT ${formatId(nft.id)}`;
  const mintRecord = nft.tokenHistory[0];

  return (
    <PageShell className="space-y-10 py-10">
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
          ...(nft.mintedAt ? { dateCreated: nft.mintedAt } : {}),
          isPartOf: { "@type": "Collection", name: SITE_NAME, url: `${SITE_URL}/gallery` },
          identifier: [
            { "@type": "PropertyValue", name: "Token ID", value: String(nft.id) },
            { "@type": "PropertyValue", name: "Contract address (Arbitrum)", value: NFT_ADDRESS },
            { "@type": "PropertyValue", name: "On-chain seed", value: nft.seed },
            ...(beautyRank ? [{ "@type": "PropertyValue", name: "Beauty rank", value: String(beautyRank) }] : [])
          ],
          image: {
            "@type": "ImageObject",
            contentUrl: nft.assets.blackImage,
            thumbnailUrl: nft.assets.blackThumb,
            license: CC0_LICENSE_URL,
            acquireLicensePage: pageUrl,
            creditText: `${SITE_NAME} ${formatId(nft.id)} (CC0)`
          },
          ...(pending
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
        }}
      />
      <PendingRefresh pending={pending} stripMessage={justMinted} />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3">
          <Breadcrumbs
            items={[
              { href: "/", label: "Home" },
              { href: "/gallery", label: "Collection" },
              { label: formatId(nft.id) }
            ]}
          />
          <h1 className="font-display text-4xl leading-none sm:text-5xl">
            {nft.name ? (
              <>
                <span className="text-muted-foreground">{formatId(nft.id)} · </span>
                {nft.name}
              </>
            ) : (
              formatId(nft.id)
            )}
          </h1>
          <p className="eyebrow">
            {justMinted
              ? "Freshly minted · the museum is rendering your six works"
              : mintRecord
                ? `Minted ${formatDateFromUnix(mintRecord.timestamp)} · CC0 · six works from one seed`
                : "CC0 · six works from one seed"}
          </p>
        </div>
        <TokenNav tokenId={nft.id} totalSupply={totalSupply} />
      </div>

      <ArtworkStage
        tokenId={nft.id}
        seed={nft.seed}
        assets={nft.assets}
        pending={pending}
        initialEdition={initialEdition}
        initialMedia={initialMedia}
      />

      <div className="grid gap-12 border-t border-border pt-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
        <Provenance nft={nft} contractAddress={NFT_ADDRESS} beautyRank={beautyRank} rankedCount={ratingOrder.length} />
        <div className="space-y-10">
          <CollectorTools tokenId={nft.id} owner={nft.owner} name={nft.name} />
          <div className="space-y-3">
            <p className="eyebrow">Take it with you</p>
            <ShareActions tokenId={nft.id} name={nft.name} assets={nft.assets} pageUrl={pageUrl} />
          </div>
        </div>
      </div>
    </PageShell>
  );
}
