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

/**
 * When the network preset is local, drop NFT/market overrides so contract addresses come from the API
 * (`rw_contracts`), not stale env.
 *
 * `delete process.env` alone is unreliable: Next may load `.env*` / shell after config evaluation and
 * re-apply `NEXT_PUBLIC_*`. Setting `env` below forces the **client bundle** to see empty strings so
 * production addresses are never inlined for `local`.
 */
const network = process.env.NEXT_PUBLIC_NETWORK?.trim().toLowerCase();
const stripLocalContractEnv = !network || network === "local";
if (stripLocalContractEnv) {
  delete process.env.NEXT_PUBLIC_NFT_ADDRESS;
  delete process.env.NEXT_PUBLIC_MARKET_ADDRESS;
}

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true"
});

function assetBaseRemotePattern(): {
  protocol: "http" | "https";
  hostname: string;
  port?: string;
  pathname: string;
} | null {
  const api = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!api) {
    return null;
  }
  try {
    const origin = api.replace(/\/+$/, "");
    const u = new URL(`${origin}/images/randomwalk`);
    return {
      protocol: u.protocol === "https:" ? "https" : "http",
      hostname: u.hostname,
      ...(u.port ? { port: u.port } : {}),
      pathname: "/**"
    };
  } catch {
    return null;
  }
}

const assetRemote = assetBaseRemotePattern();

/** Pin bare `tailwindcss` imports (e.g. from tooling) to this app’s install when parent lockfiles confuse the resolver. */
const tailwindPkgDir = path.join(projectRoot, "node_modules", "tailwindcss");

/** Webpack needs an absolute path; Turbopack treats absolute values as broken server-relative imports (Next 16). */
const asyncStorageStubWebpack = path.join(projectRoot, "src/stubs/async-storage.ts");
const asyncStorageStubTurbopack = "./src/stubs/async-storage.ts";

const nextConfig: NextConfig = {
  ...(stripLocalContractEnv
    ? {
        env: {
          NEXT_PUBLIC_NFT_ADDRESS: "",
          NEXT_PUBLIC_MARKET_ADDRESS: ""
        }
      }
    : {}),
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
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@react-native-async-storage/async-storage": asyncStorageStubWebpack
    };
    return config;
  },
  typedRoutes: true,
  reactStrictMode: true,
  allowedDevOrigins: ["http://127.0.0.1:3000", "http://localhost:3000"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nfts.cosmicsignature.com",
      },
      {
        protocol: "https",
        hostname: "randomwalknft-api.com",
      },
      ...(assetRemote ? [assetRemote] : []),
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60
  }
};

export default withBundleAnalyzer(nextConfig);
