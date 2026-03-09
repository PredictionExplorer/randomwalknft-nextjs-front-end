import type { TrustSectionContent } from "@/lib/types";

export const homepageTrustCards: TrustSectionContent[] = [
  {
    eyebrow: "Verified contracts",
    title: "Transparent and verifiable",
    body:
      "Both the NFT and marketplace contracts are verified on Arbiscan, so collectors can inspect the exact logic behind minting, trading, and withdrawals.",
    href: "https://arbiscan.io",
    linkLabel: "View on Arbiscan"
  },
  {
    eyebrow: "Collector-aligned design",
    title: "Minting value flows back to minters",
    body:
      "The incentive model is part of the product story, not hidden economics. If minting pauses for 30 days, the most recent minter can withdraw half the accumulated mint pool."
  },
  {
    eyebrow: "CC0",
    title: "A public-domain generative collection",
    body:
      "Random Walk NFT is built around collectible media that remains open and remixable. The code, media output, and provenance all reinforce the collection’s long-term cultural value."
  }
];

export const homepageHowItWorks = [
  {
    step: "01",
    title: "Mint a new path",
    body:
      "Every mint creates a new on-chain seed, which becomes the source for one still image and multiple motion outputs."
  },
  {
    step: "02",
    title: "Collect and trade",
    body:
      "Browse the gallery, buy on the zero-fee marketplace, or build a wallet-focused collection strategy around beauty score and rarity."
  },
  {
    step: "03",
    title: "Benefit from the incentive model",
    body:
      "When minting activity pauses for 30 days, the last minter can redeem half of the mint pool, keeping the system oriented toward collectors."
  }
] as const;
