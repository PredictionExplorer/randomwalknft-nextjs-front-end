/**
 * The canonical FAQ. Sources: the original site FAQ merged with the Q&As
 * published in the contracts repository README, plus Cosmic Signature utility.
 * The first six entries appear on the homepage Visitor's Guide; the whole list
 * feeds the /faq page, its FAQPage JSON-LD, and llms-full.txt.
 */
export const faqItems = [
  {
    summary: "What is Random Walk NFT?",
    detail:
      "Random Walk NFT is a generative art collection on Arbitrum, running since 2021. Each token is created from a unique on-chain seed that produces a still image and two video variants using a mathematical random walk algorithm. All artwork is CC0 (public domain), and every mint feeds an ETH vault that pays out to the last minter if minting pauses for 30 days."
  },
  {
    summary: "What is a random walk?",
    detail:
      "A random walk is a mathematical process where each step moves in a random direction — up, down, left, or right — repeated millions of times. Visualized, these paths create intricate abstract patterns. In this collection, three color channels drift in parallel with the walk, so the shape and the palette of every artwork are generated together from the same seed."
  },
  {
    summary: "How do I mint?",
    detail:
      "Install a wallet like MetaMask or Rabby, add some ETH on Arbitrum, connect your wallet on this site, and click Mint. The transaction creates your unique seed, and the artwork is generated automatically within a few minutes."
  },
  {
    summary: "How much does it cost to mint?",
    detail:
      "The mint price increases by roughly 0.1% after each mint, so it rises slowly as the collection grows. The current price is always displayed on the Mint page and read live from the contract. You will also need a small amount of ETH for Arbitrum gas fees, typically under $0.10."
  },
  {
    summary: "What do I receive when I mint?",
    detail:
      "You receive an on-chain NFT tied to a unique seed, which produces six works: a high-resolution still image and two films (a single walker and a triple walker), each rendered on black and on white backgrounds. You also become the vault keyholder — if nobody mints after you for 30 days, you can claim half the ETH in the vault."
  },
  {
    summary: "How does the Vault game work?",
    detail:
      "All ETH paid for minting goes into a vault inside the smart contract — the creators take nothing. The most recent minter holds the vault's only key. If 30 days pass without a new mint, the keyholder may withdraw half of everything inside. Any new mint resets the 30-day clock and hands the key to the new minter. After a withdrawal, the remaining half seeds the next round."
  },
  {
    summary: "How big is the vault prize?",
    detail:
      "The prize is dynamic and tied directly to minting activity: because the pool accumulates every mint while the price rises only 0.1% per mint, the claimable prize stays several hundred times the current mint price — roughly 400x to 450x. As the mint price grows, so does the potential reward. The exact live amount is shown on the Vault page and readable from the contract."
  },
  {
    summary: "Can I predict what my NFT will look like before minting?",
    detail:
      "No. The image is generated from a seed calculated at the moment of minting, using data that cannot be known in advance. This guarantees every piece is unique and unpredictable — for the minter and for everyone else."
  },
  {
    summary: "Is there a limit to how many Random Walk NFTs can be minted?",
    detail:
      "There is no hard cap. Instead, the mint price increases about 0.1% after every mint, which naturally limits the total number. Once minting becomes prohibitively expensive and pauses for 30 days, the last minter wins half the accumulated ETH."
  },
  {
    summary: "Who controls the project? Can the rules change?",
    detail:
      "Nobody controls it. The project is managed entirely by an immutable smart contract with no admin keys and no upgrade path. Neither the creators nor anyone else can change the rules, pause the game, or withdraw ETH outside the rules written into the contract at deployment in 2021."
  },
  {
    summary: "How do the creators make money?",
    detail:
      "They don't take fees. None of the ETH spent on minting goes to the creators — all of it goes into the vault. The only way the creators can benefit is if the NFTs they minted early, at low prices and under the same rules as everyone else, appreciate in value."
  },
  {
    summary: "What happens if the team disappears?",
    detail:
      "The project continues unchanged. The smart contract is autonomous and immutable, so minting, ownership, and the vault game keep working without anyone maintaining them. The image generator is open source and stored on IPFS, so anyone can regenerate every artwork from the on-chain seeds — even if this website goes offline."
  },
  {
    summary: "How are the artworks generated?",
    detail:
      "An open-source Python program reads your token's seed from the Arbitrum blockchain, expands it into a stream of random bits with SHA3-256, and walks millions of steps to draw the path while three color channels drift alongside. The full source, pinned dependencies, and instructions are published on the Open Source page and stored on IPFS."
  },
  {
    summary: "Can anyone use the generation program?",
    detail:
      "Yes. The generator is open source — anyone can run it to regenerate the images, verify their authenticity, or even build a competing site. This is deliberate: the art's existence does not depend on this website or its operators."
  },
  {
    summary: "What does CC0 mean for my NFT?",
    detail:
      "CC0 means the artwork is released into the public domain — anyone can use, remix, or redistribute it freely, including commercially. What you exclusively own is the on-chain token: the seed, the provenance, the naming rights, and its place in the vault game."
  },
  {
    summary: "Why is this on Arbitrum instead of Ethereum?",
    detail:
      "Arbitrum is an Ethereum Layer 2 that inherits Ethereum's security while offering far lower gas fees — typically under $0.10 per transaction — and faster confirmation. This keeps minting and collecting practical and affordable."
  },
  {
    summary: "Can I use my Random Walk NFT in other projects?",
    detail:
      "Yes. Random Walk NFTs have live utility in Cosmic Signature (cosmicsignature.com), a related on-chain art protocol on Arbitrum. You can anchor a token there — without selling it — to become eligible for Stellar Selection rewards of 1,000 CST and a Cosmic Signature NFT, or attach an unused token to one ETH gesture for a one-time 50% discount."
  },
  {
    summary: "What is Cosmic Signature?",
    detail:
      "Cosmic Signature is a procedural on-chain art protocol on Arbitrum, built by the same team as Random Walk NFT. Participants make gestures during Performance Cycles, and Random Walk NFT holders get special treatment: anchored tokens enter cycle-end selections, and unused tokens halve the cost of one ETH gesture."
  },
  {
    summary: "Where can I buy or sell Random Walk NFTs?",
    detail:
      "Secondary sales happen on Axiom Zero at https://www.axiomzero.market/random-walk. Listings, offers, and checkout are handled there, while this site remains the canonical place to mint, browse the collection, and view token media."
  },
  {
    summary: "What is the beauty score?",
    detail:
      "The beauty score is a community-driven ranking. On the Beauty Contest page, visitors vote between two randomly selected artworks. Over time, these votes produce a score for each token, so the collection can be browsed by what the community finds most visually compelling."
  },
  {
    summary: "Can I name my NFT?",
    detail:
      "Yes. Token owners can set a name on-chain from the token's detail page. The name is stored in the smart contract itself, so it travels with the token and appears wherever the collection is displayed."
  },
  {
    summary: "Are the smart contracts verified?",
    detail:
      "Yes. The NFT contract is verified and publicly readable on Arbiscan at 0x895a6F444BE4ba9d124F61DF736605792B35D66b. You can review every function, rule, and economic mechanism behind minting, ownership, naming, and the vault before interacting with the collection."
  },
  {
    summary: "How do I view my NFTs?",
    detail:
      "Connect your wallet and visit the My NFTs page from the account menu. You can also browse the Collection page and filter by your wallet address to see all tokens you own."
  }
] as const;
