import type { MetadataRoute } from "next";

import { getBaseConfig } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  const { SITE_URL } = getBaseConfig();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/my-nfts", "/my-offers"]
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "Google-Extended",
          "Amazonbot",
          "anthropic-ai",
          "ClaudeBot",
          "PerplexityBot",
          "Bytespider",
          "CCBot"
        ],
        allow: ["/", "/llms.txt", "/llms-full.txt"]
      }
    ],
    sitemap: `${SITE_URL}/sitemap.xml`
  };
}
