import { NextResponse } from "next/server";

import { AXIOM_ZERO_MARKETPLACE_URL } from "@/lib/config";
import { getAppConfig } from "@/lib/server/app-config";

export async function GET() {
  const { NFT_ADDRESS, SITE_DESCRIPTION, SITE_NAME, SITE_URL } = await getAppConfig();
  const content = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

## About

Random Walk NFT is a generative art collection deployed on Arbitrum (Ethereum Layer 2). Each mint produces a unique on-chain seed that is used to generate still images and motion artworks via a mathematical random walk algorithm. All artwork is released under CC0 (public domain). Secondary collecting happens on Axiom Zero, while this site remains the canonical home for minting, browsing, token media, provenance, and the mint pool incentive where the last minter can claim ETH if minting pauses for 30 days.

## Key Facts

- Blockchain: Arbitrum (Ethereum L2)
- NFT contract: ${NFT_ADDRESS}
- License: CC0 Public Domain
- Secondary marketplace: ${AXIOM_ZERO_MARKETPLACE_URL}
- Art generation: Python-based random walk algorithm from on-chain seeds

## Pages

- Home: ${SITE_URL}/
- Gallery (full collection): ${SITE_URL}/gallery
- Marketplace (Axiom Zero): ${AXIOM_ZERO_MARKETPLACE_URL}
- Mint (create new NFT): ${SITE_URL}/mint
- Beauty Contest (community voting): ${SITE_URL}/compare
- Random Image Viewer: ${SITE_URL}/random
- Random Video Viewer: ${SITE_URL}/random-video
- Open Source (full generator source): ${SITE_URL}/code
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
