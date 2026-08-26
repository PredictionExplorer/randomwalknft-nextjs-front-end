import type { MetadataRoute } from "next";

import { getBaseConfig } from "@/lib/config";

/**
 * AI crawler fleet (2026): training collectors, answer-engine search indexers,
 * and user-triggered fetchers. All are welcome — AI answer engines citing this
 * site is a distribution channel, and the content is public-domain art plus
 * on-chain facts. The paths blocked for everyone stay blocked here too.
 */
const AI_CRAWLERS = [
  // OpenAI: training, ChatGPT search index, user-triggered browsing
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  // Anthropic: training, Claude search index, user-triggered browsing
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "anthropic-ai",
  // Perplexity: search index + user-triggered retrieval
  "PerplexityBot",
  "Perplexity-User",
  // Google & Apple training-control tokens (search bots follow the * rule)
  "Google-Extended",
  "Applebot",
  "Applebot-Extended",
  // Meta: training + user-triggered fetches
  "Meta-ExternalAgent",
  "Meta-ExternalFetcher",
  // Others: DuckDuckGo assist, Amazon/Alexa, Common Crawl, Cohere, AI2, You.com, ByteDance
  "DuckAssistBot",
  "Amazonbot",
  "CCBot",
  "cohere-ai",
  "AI2Bot",
  "YouBot",
  "Bytespider"
];

const DISALLOWED_PATHS = ["/api/", "/my-nfts"];

export default function robots(): MetadataRoute.Robots {
  const { SITE_URL } = getBaseConfig();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOWED_PATHS
      },
      {
        userAgent: AI_CRAWLERS,
        allow: "/",
        disallow: DISALLOWED_PATHS
      }
    ],
    sitemap: `${SITE_URL}/sitemap.xml`
  };
}
