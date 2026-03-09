import type { MetadataRoute } from "next";

import { NFT_ADDRESS, SITE_URL } from "@/lib/config";
import { nftAbi } from "@/generated/wagmi";
import { publicClient } from "@/lib/web3/public-client";

const staticRoutes = [
  "",
  "/mint",
  "/redeem",
  "/gallery",
  "/marketplace",
  "/trading",
  "/compare",
  "/random",
  "/random-video",
  "/code",
  "/faq",
  "/my-nfts",
  "/my-offers"
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${SITE_URL}${route}`,
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.7
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
      changeFrequency: "weekly" as const,
      priority: 0.5
    }));
  } catch {
    // Gracefully degrade if contract read fails during build
  }

  return [...staticEntries, ...detailEntries];
}
