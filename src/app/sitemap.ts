import type { MetadataRoute } from "next";

import { getBaseConfig } from "@/lib/config";
import { getAppConfig } from "@/lib/server/app-config";
import { nftAbi } from "@/generated/wagmi";
import { createAssetUrls } from "@/lib/utils";
import { getPublicClient } from "@/lib/web3/public-client";

type SitemapEntry = {
  route: string;
  changeFrequency: "hourly" | "daily" | "weekly" | "monthly";
  priority: number;
};

const staticRoutes: SitemapEntry[] = [
  { route: "", changeFrequency: "hourly", priority: 1.0 },
  { route: "/gallery", changeFrequency: "daily", priority: 0.8 },
  { route: "/atelier", changeFrequency: "monthly", priority: 0.7 },
  { route: "/mint", changeFrequency: "daily", priority: 0.8 },
  { route: "/vault", changeFrequency: "hourly", priority: 0.8 },
  { route: "/how-it-works", changeFrequency: "monthly", priority: 0.7 },
  { route: "/faq", changeFrequency: "monthly", priority: 0.6 },
  { route: "/compare", changeFrequency: "daily", priority: 0.5 },
  { route: "/code", changeFrequency: "monthly", priority: 0.4 },
  { route: "/random", changeFrequency: "daily", priority: 0.3 },
  { route: "/random-video", changeFrequency: "daily", priority: 0.3 }
];

/** Newest tokens still see ownership/name churn; older ones rarely change. */
const RECENT_TOKEN_WINDOW = 200;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { SITE_URL } = getBaseConfig();

  // No lastModified on purpose: stamping "now" on every entry on every request
  // teaches crawlers to ignore the site's freshness signals entirely.
  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((entry) => ({
    url: `${SITE_URL}${entry.route}`,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority
  }));

  let detailEntries: MetadataRoute.Sitemap = [];
  try {
    const { NFT_ADDRESS } = await getAppConfig();
    const totalSupply = Number(
      await getPublicClient().readContract({
        address: NFT_ADDRESS,
        abi: nftAbi,
        functionName: "totalSupply"
      })
    );

    detailEntries = Array.from({ length: totalSupply }, (_, tokenId) => ({
      url: `${SITE_URL}/detail/${tokenId}`,
      changeFrequency: tokenId >= totalSupply - RECENT_TOKEN_WINDOW ? ("weekly" as const) : ("monthly" as const),
      priority: 0.5,
      images: [createAssetUrls(tokenId).blackImage]
    }));
  } catch {
    // Gracefully degrade if contract read fails during build
  }

  return [...staticEntries, ...detailEntries];
}
