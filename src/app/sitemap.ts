import type { MetadataRoute } from "next";

import { getBlogs } from "@/lib/api/public";
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
  "/blog",
  "/my-nfts",
  "/my-offers",
  "/auth/login",
  "/auth/register",
  "/admin"
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogs = await getBlogs();

  return [
    ...staticRoutes.map((route) => ({
      url: `${SITE_URL}${route}`,
      changeFrequency: "daily" as const,
      priority: route === "" ? 1 : 0.7
    })),
    ...blogs.map((blog) => ({
      url: `${SITE_URL}/blog/${blog.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6
    }))
  ];
}
