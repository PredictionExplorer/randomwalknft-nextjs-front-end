export const faqItems = [
  {
    summary: "How do I mint Random Walk NFTs?",
    detail:
      "Install a browser wallet such as MetaMask, fund it with ETH on Arbitrum, connect it on the site, and mint the next available token. The mint action triggers the on-chain seed that powers the final image and motion outputs."
  },
  {
    summary: "Why Arbitrum?",
    detail:
      "Random Walk NFT uses Arbitrum for lower fees and faster collector interactions. That keeps minting, bidding, and secondary trading practical without changing the collection’s on-chain provenance."
  },
  {
    summary: "How many Random Walk NFTs will there be?",
    detail:
      "The mint price increases by roughly 0.1% after each mint, so supply growth slows dramatically over time. A few thousand minted NFTs is more plausible than a very large collection."
  },
  {
    summary: "How does the mint incentive model work?",
    detail:
      "If minting pauses for 30 days, the most recent minter can withdraw half of the ETH spent on minting up to that point. The remaining half stays in the contract, so collector activity continues to shape the economics over time."
  },
  {
    summary: "Are the contracts verified?",
    detail:
      "Yes. Both the NFT contract and the marketplace contract are verified on Arbiscan, so collectors can inspect the underlying code directly."
  },
  {
    summary: "What is the marketplace fee?",
    detail: "The built-in marketplace charges 0% fees."
  },
  {
    summary: "What exactly do collectors own?",
    detail:
      "Collectors own an on-chain Random Walk NFT tied to a seed, plus a family of generated media outputs derived from that seed. The collection is CC0, so the artwork is public domain while ownership and provenance stay on-chain."
  },
  {
    summary: "How are the images and videos generated?",
    detail:
      "Each mint starts with a deterministic seed from the contract. That seed feeds a Python-based random walk that generates both still imagery and motion variants from the same mathematical origin."
  },
  {
    summary: "What is a random walk?",
    detail:
      "A random walk is a path built by taking steps in random directions. When that process is repeated enough times and visualized, it produces the abstract structures that define the collection."
  },
  {
    summary: "How are the colors generated?",
    detail:
      "Color is driven by the same generative system. While the walk moves through space, a parallel walk happens in color space, so each piece evolves composition and palette together."
  },
  {
    summary: "Does the creator have special privileges?",
    detail:
      "No. Once deployed, the creator follows the same rules as everyone else. Minting, trading, and redemption privileges are not reserved for a team wallet."
  }
] as const;
