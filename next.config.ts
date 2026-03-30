import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true"
});

function assetBaseRemotePattern(): {
  protocol: "http" | "https";
  hostname: string;
  port?: string;
  pathname: string;
} | null {
  const raw = process.env.NEXT_PUBLIC_ASSET_BASE_URL?.trim();
  if (!raw) {
    return null;
  }
  try {
    const u = new URL(raw);
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

const nextConfig: NextConfig = {
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
