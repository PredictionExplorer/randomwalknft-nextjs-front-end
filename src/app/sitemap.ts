import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/config";

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
  return staticRoutes.map((route) => ({
    url: `${SITE_URL}${route}`,
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.7
  }));
}
