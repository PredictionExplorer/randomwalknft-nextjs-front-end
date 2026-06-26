import type { TrustSectionContent } from "@/lib/types";

export const homepageTrustCards: TrustSectionContent[] = [
  {
    eyebrow: "Verified contracts",
    title: "Fully transparent on-chain",
    body:
      "The NFT contract is verified on Arbiscan. Anyone can inspect the exact logic behind minting, ownership, naming, and withdrawals before committing a single transaction.",
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
    title: "Browse and collect",
    body:
      "Browse the collection ranked by community beauty scores. When you want the secondary market, continue to the Random Walk marketplace on Axiom Zero."
  },
  {
    step: "03",
    title: "Earn from the mint pool",
    body:
      "When minting pauses for 30 days, the last minter can claim half the ETH in the mint pool. The other half stays in the contract for future collectors."
  }
] as const;

export const homepageCosmicSignature = {
  eyebrow: "Cosmic Signature",
  description:
    "Random Walk NFTs are connected to Cosmic Signature, a procedural on-chain art protocol on Arbitrum where participants make gestures during Performance Cycles.",
  href: "https://cosmicsignature.com/",
  linkLabel: "Explore Cosmic Signature",
  definitions: {
    gesture:
      "A protocol action on Cosmic Signature made with ETH or CST. Each gesture shapes the current Performance Cycle and records an entry for Stellar Selection.",
    gestureCost:
      "The live ETH or CST amount required to make a gesture. An unused Random Walk NFT can be attached once to an ETH gesture for a 50% cost reduction.",
    anchored:
      "Anchoring connects an NFT to the Cosmic Signature protocol without selling it, making Random Walk NFTs eligible for Anchored-NFT Stellar Selection.",
    anchoredSelection:
      "A cycle-end selection for anchored Random Walk NFT holders. Selected holders receive 1,000 CST and one Cosmic Signature NFT.",
    cst:
      "Cosmic Signature Token, the ERC-20 token used by the Cosmic Signature protocol."
  },
  utilityCards: [
    {
      eyebrow: "Anchor utility",
      title: "Enter Anchored-NFT Stellar Selection",
      body:
        "Anchor a Random Walk NFT on Cosmic Signature to become eligible for a cycle-end selection where chosen holders receive 1,000 CST and a Cosmic Signature NFT."
    },
    {
      eyebrow: "Gesture utility",
      title: "Receive a one-time 50% discount",
      body:
        "Attach an unused Random Walk NFT to one ETH gesture to receive a 50% ETH Gesture Cost reduction. Once used for the discount, that token cannot be used for the same reduction again."
    }
  ]
} as const;
