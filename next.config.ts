import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

/**
 * Absolute path to this app (directory containing `next.config.ts`). When a parent folder has another
 * lockfile, tooling can infer the wrong workspace root. `package.json` runs `next dev --webpack` by
 * default so PostCSS/Tailwind resolve from this project; use `pnpm dev:turbo` only if you do not have
 * that layout issue.
 */
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)));

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true"
});

const AXIOM_ZERO_MARKETPLACE_URL = "https://www.axiomzero.market/random-walk";

type AssetRemotePattern = {
  protocol: "http" | "https";
  hostname: string;
  port?: string;
  pathname: string;
};

/**
 * One remote pattern per configured API origin. `NEXT_PUBLIC_API_URLS` is the
 * comma-separated rotation list (see `src/lib/server-rotation.ts`); the singular
 * `NEXT_PUBLIC_API_BASE_URL` is the one-server fallback. Assets may be served from
 * any of them depending on the hourly rotation.
 */
function assetBaseRemotePatterns(): AssetRemotePattern[] {
  const raw = process.env.NEXT_PUBLIC_API_URLS?.trim() || process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "";
  const origins = raw
    .split(",")
    .map((u) => u.trim().replace(/\/+$/, ""))
    .filter(Boolean);
  const patterns: AssetRemotePattern[] = [];
  for (const origin of origins) {
    try {
      const u = new URL(`${origin}/images/randomwalk`);
      patterns.push({
        protocol: u.protocol === "https:" ? "https" : "http",
        hostname: u.hostname,
        ...(u.port ? { port: u.port } : {}),
        pathname: "/**"
      });
    } catch {
      // Skip malformed origins; the app-level env validation reports them.
    }
  }
  return patterns;
}

const assetRemotes = assetBaseRemotePatterns();

/** Pin bare `tailwindcss` imports (e.g. from tooling) to this app’s install when parent lockfiles confuse the resolver. */
const tailwindPkgDir = path.join(projectRoot, "node_modules", "tailwindcss");

const nextConfig: NextConfig = {
  /**
   * Both must match (see `next/dist/server/config.js`): otherwise Next falls back to lockfile-based
   * inference when a parent directory has another lockfile.
   */
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
    resolveAlias: {
      tailwindcss: tailwindPkgDir
    }
  },
  typedRoutes: true,
  reactStrictMode: true,
  /** The repository keeps its own README; skip Next's generated AGENTS.md/CLAUDE.md. */
  agentRules: false,
  /**
   * React Compiler (stable in Next 16): automatic memoization across every component.
   * View Transitions need no flag: the App Router ships React canary, so `ViewTransition`
   * is importable from `react` directly.
   */
  reactCompiler: true,
  cacheComponents: true,
  /**
   * Crawlers and answer engines that do not run JavaScript get blocking (non-streamed)
   * metadata: Next's default list plus the major search and AI crawlers, and Lighthouse
   * so budgets measure what those crawlers see.
   */
  htmlLimitedBots:
    /Mediapartners-Google|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Googlebot|Google-InspectionTool|Chrome-Lighthouse|GPTBot|OAI-SearchBot|ChatGPT-User|ClaudeBot|anthropic-ai|PerplexityBot|Bytespider|CCBot|Amazonbot|meta-externalagent/i,
  redirects() {
    return Promise.resolve([
      {
        source: "/marketplace",
        destination: AXIOM_ZERO_MARKETPLACE_URL,
        permanent: true
      },
      {
        source: "/redeem",
        destination: "/vault",
        permanent: true
      }
    ]);
  },
  allowedDevOrigins: ["http://127.0.0.1:3000", "http://localhost:3000"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nfts.cosmicsignature.com"
      },
      {
        protocol: "https",
        hostname: "randomwalknft-api.com"
      },
      ...assetRemotes
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60
  }
};

export default withBundleAnalyzer(nextConfig);
