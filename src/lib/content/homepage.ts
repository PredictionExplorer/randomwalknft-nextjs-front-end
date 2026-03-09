import type { TrustSectionContent } from "@/lib/types";

export const homepageTrustCards: TrustSectionContent[] = [
  {
    eyebrow: "Verified contracts",
    title: "Fully transparent on-chain",
    body:
      "Both the NFT and marketplace contracts are verified on Arbiscan. Anyone can inspect the exact logic behind minting, trading, and withdrawals before committing a single transaction.",
    href: "https://arbiscan.io",
    linkLabel: "View on Arbiscan"
  },
  {
    eyebrow: "Collector-aligned economics",
    title: "Mint value flows back to you",
    body:
      "This is not a creator cash-grab. If no one mints for 30 days, the most recent minter can withdraw half of the accumulated mint pool — keeping the economics aligned with collectors."
  },
  {
    eyebrow: "CC0 public domain",
    title: "Own it, remix it, share it",
    body:
      "All artwork is released under CC0 — completely public domain. You own the on-chain token and provenance, while the art itself stays free for anyone to use, remix, or build upon."
  }
];

export const homepageHowItWorks = [
  {
    step: "01",
    title: "Mint your NFT",
    body:
      "Each mint creates a unique on-chain seed. That seed is used to generate a one-of-a-kind still image and multiple motion variants — all tied to your token."
  },
  {
    step: "02",
    title: "Collect and trade",
    body:
      "Browse the collection ranked by community beauty scores. Buy and sell on the built-in zero-fee marketplace — no platform cuts, ever."
  },
  {
    step: "03",
    title: "Earn from the mint pool",
    body:
      "When minting pauses for 30 days, the last minter can claim half the ETH in the mint pool. The other half stays in the contract for future collectors."
  }
] as const;
