import { NextResponse } from "next/server";

import { MARKET_ADDRESS, NFT_ADDRESS, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/config";

export function GET() {
  const content = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

## About

Random Walk NFT is a generative art collection deployed on Arbitrum (Ethereum Layer 2). Each mint produces a unique on-chain seed that is used to generate still images and motion artworks via a mathematical random walk algorithm. All artwork is released under CC0 (public domain). The project features a zero-fee marketplace with no platform cuts and a mint pool incentive where the last minter can claim ETH if minting pauses for 30 days.

## Key Facts

- Blockchain: Arbitrum (Ethereum L2)
- NFT contract: ${NFT_ADDRESS}
- Marketplace contract: ${MARKET_ADDRESS}
- License: CC0 Public Domain
- Marketplace fee: 0%
- Art generation: Python-based random walk algorithm from on-chain seeds

## Pages

- Home: ${SITE_URL}/
- Gallery (full collection): ${SITE_URL}/gallery
- Marketplace (buy/sell): ${SITE_URL}/marketplace
- Mint (create new NFT): ${SITE_URL}/mint
- Trading History: ${SITE_URL}/trading
- Beauty Contest (community voting): ${SITE_URL}/compare
- Random Image Viewer: ${SITE_URL}/random
- Random Video Viewer: ${SITE_URL}/random-video
- Generation Code (full source): ${SITE_URL}/code
- FAQ: ${SITE_URL}/faq
- Redeem (mint pool withdrawal): ${SITE_URL}/redeem

## Extended Information

- Full content version: ${SITE_URL}/llms-full.txt
`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400"
    }
  });
}
