import type { TrustSectionContent } from "@/lib/types";

/**
 * The Charter: the museum's standing guarantees, consolidated in one place.
 * Also rendered on /faq and exported to llms-full.txt.
 */
export const homepageCharter: TrustSectionContent[] = [
  {
    eyebrow: "Immutable contract",
    title: "The rules can never change",
    body:
      "The smart contract that runs this collection has no admin keys and cannot be upgraded. Nobody — including the creators — can alter the rules, pause the game, or take ETH out of the vault by any path other than the one written into the code in 2021.",
    href: "https://arbiscan.io/address/0x895a6F444BE4ba9d124F61DF736605792B35D66b#code",
    linkLabel: "Read the verified contract"
  },
  {
    eyebrow: "Zero creator fees",
    title: "Every wei goes into the vault",
    body:
      "The creators take nothing from minting. All ETH paid for mints goes into the contract's prize pool, where the last-minter game decides who claims it. The creators minted early like everyone else — that is their only stake."
  },
  {
    eyebrow: "CC0 public domain",
    title: "The art belongs to everyone",
    body:
      "Every artwork is released under CC0 — free for anyone to use, remix, or sell. What you own on-chain is the token itself: the seed, the provenance, the naming rights, and the place in the game."
  },
  {
    eyebrow: "Open-source generator",
    title: "Anyone can rebuild the art",
    body:
      "The Python program that turns seeds into images and films is open source and pinned on IPFS. If this website vanished tomorrow, every artwork could be regenerated from the chain by anyone, forever.",
    href: "/code",
    linkLabel: "See the generator source"
  }
];

/** The Annex: Cosmic Signature utility, in plain language. */
export const homepageAnnex = {
  eyebrow: "The Annex",
  heading: "What can you do with a Random Walk NFT?",
  body:
    "Beyond collecting and the vault game, Random Walk NFTs have live utility in Cosmic Signature, a closely related on-chain art protocol on Arbitrum by the same team. Holders can put their tokens to work there in two ways.",
  cards: [
    {
      title: "Anchor it for rewards",
      body:
        "Anchor a Random Walk NFT on Cosmic Signature — without selling it — to become eligible for Stellar Selection, where chosen holders receive 1,000 CST tokens and a Cosmic Signature NFT at the end of each cycle."
    },
    {
      title: "Spend it for a 50% discount",
      body:
        "Attach an unused Random Walk NFT to one ETH gesture on Cosmic Signature and pay half the usual cost. Each token can grant this discount once."
    }
  ],
  href: "https://cosmicsignature.com/",
  linkLabel: "Use your Random Walk NFT in Cosmic Signature"
} as const;
