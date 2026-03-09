import { NextResponse } from "next/server";

import { faqItems } from "@/lib/content/faq";
import { homepageHowItWorks, homepageTrustCards } from "@/lib/content/homepage";
import { MARKET_ADDRESS, NFT_ADDRESS, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/config";

export function GET() {
  const faqSection = faqItems
    .map((item) => `### ${item.summary}\n\n${item.detail}`)
    .join("\n\n");

  const howItWorksSection = homepageHowItWorks
    .map((item) => `### Step ${item.step}: ${item.title}\n\n${item.body}`)
    .join("\n\n");

  const trustSection = homepageTrustCards
    .map((item) => `### ${item.title}\n\n${item.body}`)
    .join("\n\n");

  const content = `# ${SITE_NAME} — Complete Reference

> ${SITE_DESCRIPTION}

## Overview

Random Walk NFT is a generative art collection deployed on Arbitrum (Ethereum Layer 2). Each mint produces a unique on-chain seed that is used to generate still images and motion artworks via a mathematical random walk algorithm. A random walk is a mathematical process where each step moves in a random direction — when repeated thousands of times and visualized, these paths create intricate abstract patterns. Color evolves in parallel, so composition and palette are generated together from the same seed.

All artwork is released under CC0 (public domain), meaning anyone can use, remix, or redistribute it freely. However, the on-chain token itself (ownership, provenance, and naming rights) belongs exclusively to the wallet that holds it.

## Key Facts

- Blockchain: Arbitrum (Ethereum L2)
- NFT contract: ${NFT_ADDRESS} (verified on Arbiscan)
- Marketplace contract: ${MARKET_ADDRESS} (verified on Arbiscan)
- License: CC0 Public Domain
- Marketplace fee: 0% — the full amount goes directly between buyer and seller
- Art generation: Python-based random walk algorithm from on-chain seeds
- Gas cost: Under $0.10 on Arbitrum
- Smart contracts: No admin keys or special access — the creator follows the same rules as every participant

## How It Works

${howItWorksSection}

## Mint Pool Incentive

ETH from every mint goes into a shared pool inside the smart contract. If 30 days pass without a new mint, the most recent minter becomes eligible to withdraw half the pool. The remaining half stays in the contract, preserving the incentive for future collectors. This mechanism aligns economic incentives between the project and its collectors.

## Marketplace

The built-in marketplace charges zero fees. When you buy or sell, the full amount goes directly between buyer and seller with no platform cut. Sellers can list their NFTs at a set price, and buyers can make offers on any token — even unlisted ones. All trading is handled by the verified on-chain marketplace contract.

## Beauty Contest

The beauty score is a community-driven ranking system. On the Beauty Contest page, visitors vote between two randomly selected artworks. Over time, these votes produce a score for each token, allowing the collection to be browsed by what the community finds most visually compelling.

## Reproducibility

The project is fully reproducible. The complete Python generator code, pinned dependencies, and step-by-step instructions are published on the site. Any collector can regenerate their token's artwork locally using the on-chain seed.

## Why Collectors Trust It

${trustSection}

## Pages

- Home: ${SITE_URL}/
- Gallery (browse full collection, sort by newest or beauty score): ${SITE_URL}/gallery
- Marketplace (buy/sell with zero fees): ${SITE_URL}/marketplace
- Mint (create a new NFT): ${SITE_URL}/mint
- NFT Detail (view artwork, trade, see history): ${SITE_URL}/detail/[id]
- Trading History (all sales): ${SITE_URL}/trading
- Beauty Contest (vote on pairs): ${SITE_URL}/compare
- Random Image Viewer: ${SITE_URL}/random
- Random Video Viewer: ${SITE_URL}/random-video
- Generation Code (full Python source): ${SITE_URL}/code
- FAQ: ${SITE_URL}/faq
- Redeem (mint pool withdrawal): ${SITE_URL}/redeem

## Frequently Asked Questions

${faqSection}

## Community

- Twitter: https://twitter.com/RandomWalkNFT
- Discord: https://discord.gg/bGnPn96Qwt
`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400"
    }
  });
}
