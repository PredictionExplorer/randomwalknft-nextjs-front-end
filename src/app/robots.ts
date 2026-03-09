import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
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
