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

/** The slice of webpack's configuration this file touches; Next types the callback argument as `any`. */
type WebpackAliasConfig = {
  resolve: { alias?: Record<string, string | false | string[]> };
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

/** Webpack needs an absolute path; Turbopack treats absolute values as broken server-relative imports (Next 16). */
const asyncStorageStubWebpack = path.join(projectRoot, "src/stubs/async-storage.ts");
const asyncStorageStubTurbopack = "./src/stubs/async-storage.ts";

const nextConfig: NextConfig = {
  /**
   * Both must match (see `next/dist/server/config.js`): otherwise Next falls back to lockfile-based
   * inference when a parent directory has another lockfile.
   */
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
    resolveAlias: {
      tailwindcss: tailwindPkgDir,
      "@react-native-async-storage/async-storage": asyncStorageStubTurbopack
    }
  },
  webpack: (config: WebpackAliasConfig) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@react-native-async-storage/async-storage": asyncStorageStubWebpack
    };
    return config;
  },
  typedRoutes: true,
  reactStrictMode: true,
  /**
   * React Compiler (stable in Next 16): automatic memoization across every component.
   * View Transitions need no flag: the App Router ships React canary, so `ViewTransition`
   * is importable from `react` directly.
   */
  reactCompiler: true,
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
