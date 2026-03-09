export const faqItems = [
  {
    summary: "What is Random Walk NFT?",
    detail:
      "Random Walk NFT is a generative art collection on Arbitrum. Each token is created from a unique on-chain seed that produces a still image and multiple video variants using a mathematical random walk algorithm. The collection is CC0 (public domain) and features a built-in incentive model that returns ETH to collectors."
  },
  {
    summary: "How do I mint?",
    detail:
      "Install a wallet like MetaMask or Rabby, add some ETH on Arbitrum, connect your wallet on this site, and click Mint. The transaction creates your unique seed, and the artwork is generated automatically within a few minutes."
  },
  {
    summary: "What do I receive when I mint?",
    detail:
      "You receive an on-chain NFT token tied to a unique seed. From that seed, the system generates a high-resolution still image and two video variants (single and triple motion). All media is viewable and downloadable from your token's detail page."
  },
  {
    summary: "How much does it cost to mint?",
    detail:
      "The mint price increases by roughly 0.1% after each mint, starting from a low base. The current price is always displayed on the Mint page. You will also need a small amount of ETH for Arbitrum gas fees, which are typically under $0.10."
  },
  {
    summary: "Why is this on Arbitrum instead of Ethereum?",
    detail:
      "Arbitrum is an Ethereum Layer 2 that offers the same security guarantees as Ethereum mainnet but with significantly lower gas fees and faster transactions. This makes minting, trading, and bidding practical and affordable."
  },
  {
    summary: "How does the mint pool incentive work?",
    detail:
      "ETH from every mint goes into a shared pool inside the smart contract. If 30 days pass without a new mint, the most recent minter becomes eligible to withdraw half the pool. The remaining half stays in the contract, preserving the incentive for future collectors."
  },
  {
    summary: "Is there a marketplace fee?",
    detail:
      "No. The built-in marketplace charges zero fees. When you buy or sell, the full amount goes directly between buyer and seller with no platform cut."
  },
  {
    summary: "How do I sell my NFT?",
    detail:
      "Go to your token's detail page, enter a price in ETH, and click List. Your NFT will appear on the marketplace immediately. You can cancel the listing at any time. Buyers can also make offers on any token, even if it is not listed."
  },
  {
    summary: "What is the beauty score?",
    detail:
      "The beauty score is a community-driven ranking. On the Beauty Contest page, visitors vote between two randomly selected artworks. Over time, these votes produce a score for each token, so the collection can be browsed by what the community finds most visually compelling."
  },
  {
    summary: "Are the smart contracts verified?",
    detail:
      "Yes. Both the NFT contract and the marketplace contract are verified and publicly readable on Arbiscan. You can review every function, rule, and economic mechanism before interacting with the collection."
  },
  {
    summary: "What does CC0 mean for my NFT?",
    detail:
      "CC0 means the artwork is released into the public domain — anyone can use, remix, or redistribute it freely. However, the on-chain token itself (ownership, provenance, and naming rights) belongs exclusively to the wallet that holds it."
  },
  {
    summary: "What is a random walk?",
    detail:
      "A random walk is a mathematical process where each step moves in a random direction. When repeated thousands of times and visualized, these paths create the intricate abstract patterns that define the collection. Color evolves in parallel, so composition and palette are generated together from the same seed."
  },
  {
    summary: "How do I view my NFTs?",
    detail:
      "Connect your wallet and visit the My NFTs page from the account menu. You can also browse the Collection page and filter by your wallet address to see all tokens you own."
  },
  {
    summary: "Does the creator have special privileges?",
    detail:
      "No. The smart contracts have no admin keys or special access. Once deployed, the creator follows the same rules as every other participant — minting, trading, and redemption work identically for everyone."
  }
] as const;
