import type { MetadataRoute } from "next";

import { getConfig } from "@/lib/config";
import { nftAbi } from "@/generated/wagmi";
import { publicClient } from "@/lib/web3/public-client";

type SitemapEntry = {
  route: string;
  changeFrequency: "daily" | "weekly" | "monthly";
  priority: number;
};

const staticRoutes: SitemapEntry[] = [
  { route: "", changeFrequency: "daily", priority: 1.0 },
  { route: "/gallery", changeFrequency: "daily", priority: 0.8 },
  { route: "/marketplace", changeFrequency: "daily", priority: 0.8 },
  { route: "/mint", changeFrequency: "daily", priority: 0.7 },
  { route: "/trading", changeFrequency: "daily", priority: 0.6 },
  { route: "/compare", changeFrequency: "daily", priority: 0.5 },
  { route: "/faq", changeFrequency: "monthly", priority: 0.5 },
  { route: "/code", changeFrequency: "monthly", priority: 0.4 },
  { route: "/redeem", changeFrequency: "weekly", priority: 0.4 },
  { route: "/random", changeFrequency: "daily", priority: 0.3 },
  { route: "/random-video", changeFrequency: "daily", priority: 0.3 }
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { NFT_ADDRESS, SITE_URL } = getConfig();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((entry) => ({
    url: `${SITE_URL}${entry.route}`,
    lastModified: now,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority
  }));

  let detailEntries: MetadataRoute.Sitemap = [];
  try {
    const totalSupply = Number(
      (await publicClient.readContract({
        address: NFT_ADDRESS,
        abi: nftAbi,
        functionName: "totalSupply"
      })) as bigint
    );

    detailEntries = Array.from({ length: totalSupply }, (_, index) => ({
      url: `${SITE_URL}/detail/${index}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.5
    }));
  } catch {
    // Gracefully degrade if contract read fails during build
  }

  return [...staticEntries, ...detailEntries];
}
