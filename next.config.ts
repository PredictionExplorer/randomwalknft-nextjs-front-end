import type { NextConfig } from "next";

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
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60
  }
};

export default nextConfig;
