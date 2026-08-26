import { NextResponse } from "next/server";

import { getVaultState } from "@/lib/api/public";
import { faqItems } from "@/lib/content/faq";
import { homepageCharter } from "@/lib/content/homepage";
import { AXIOM_ZERO_MARKETPLACE_URL, CONTRACTS_GITHUB_URL, COSMIC_SIGNATURE_URL } from "@/lib/config";
import { getAppConfig } from "@/lib/server/app-config";

export async function GET() {
  const { NFT_ADDRESS, SITE_DESCRIPTION, SITE_NAME, SITE_URL } = await getAppConfig();
  const vault = await getVaultState().catch(() => null);
  const asOf = new Date().toISOString().slice(0, 10);

  const faqSection = faqItems
    .map((item) => `### ${item.summary}\n\n${item.detail}`)
    .join("\n\n");

  const charterSection = homepageCharter
    .map((item) => `### ${item.title}\n\n${item.body}`)
    .join("\n\n");

  const liveFacts = vault
    ? `
## Live State (as of ${asOf})

- Works minted: ${vault.mintedCount.toLocaleString("en-US")}
- Current mint price: ${vault.mintPriceEth?.toFixed(4) ?? "unknown"} ETH
- Vault prize (claimable by the last minter after 30 quiet days): ${vault.prizeEth.toFixed(2)} ETH
- Prize-to-mint-price ratio: ${
        vault.mintPriceEth && vault.mintPriceEth > 0
          ? `about ${Math.round(vault.prizeEth / vault.mintPriceEth)}x`
          : "several hundred x"
      }
- Days until the current keyholder can withdraw: ${(vault.secondsUntilWithdrawal / 86_400).toFixed(1)}
- Current keyholder (last minter): ${vault.lastMinter ?? "none recorded"}
- Times the vault has ever been claimed since 2021: ${vault.numWithdrawals}
`
    : "";

  const content = `# ${SITE_NAME} — Complete Reference

> ${SITE_DESCRIPTION}

## Overview

Random Walk NFT is a generative art collection and an on-chain game, deployed on Arbitrum (Ethereum Layer 2) in 2021. Each mint produces a unique on-chain seed that generates six artworks — a high-resolution still image and two films (single walker and triple walker), each rendered on black and on white backgrounds — via a mathematical random walk algorithm.

A random walk is a process where each step moves in a random direction (up, down, left, or right), repeated millions of times. Three color channels drift in parallel with the walk, so composition and palette are generated together from the same seed. All artwork is released under CC0 (public domain); the on-chain token (seed, provenance, naming rights, game position) belongs exclusively to the wallet that holds it.

## The Vault Game (exact rules)

1. All ETH paid for minting goes into a vault inside the smart contract. The creators receive 0% — they minted early under the same rules as everyone else, and that is their only stake.
2. The most recent minter is the "keyholder" (contract: lastMinter).
3. If 30 days pass without a new mint, the keyholder may call withdraw() and receive HALF of all ETH in the contract (contract: withdrawalAmount, timeUntilWithdrawal).
4. Any new mint resets the 30-day clock and hands the key to the new minter.
5. After a withdrawal, the remaining half stays in the contract and the game continues with the next round.
6. The mint price rises about 0.1% per mint (a factor of 1.001, doubling roughly every 693 mints). There is no supply cap; the rising price is the only limit.
7. Because the pool accumulates every mint while the price grows slowly, the claimable prize remains several hundred times the current mint price (roughly 400x-450x).
8. The contract is immutable: no admin keys, no upgrade path, no way for anyone to change the rules or take ETH outside them.
${liveFacts}
## How the Art Is Generated

1. Read the token's 32-byte seed from the contract (function: seeds(tokenId)).
2. Expand the seed into a bit stream: repeatedly compute SHA3-256(initial_seed || previous_digest) and emit each digest's bits.
3. Take two bits per step to choose a direction (right, left, up, down) and walk until the path fills a 1.6:1 canvas (about 2400x1500 plus a 3% border) — typically millions of steps.
4. Generate three color channels, each drifting +/-1 per step, then normalize each to the 0-255 range; the i-th point of the path is drawn in the i-th RGB color.
5. Render the still image (black and white background variants) and two films: a single walker drawing the path in order, and three walkers drawing simultaneously.

The complete Python source, pinned dependencies, and step-by-step instructions are published at ${SITE_URL}/code and stored on IPFS. Anyone can regenerate every artwork from on-chain data — the art does not depend on this website existing.

## Key Facts

- Blockchain: Arbitrum One (Ethereum L2), chain id 42161
- NFT contract (verified on Arbiscan): ${NFT_ADDRESS}
- Launched: 2021
- License: CC0 Public Domain
- Contract source repository: ${CONTRACTS_GITHUB_URL}
- Secondary marketplace: ${AXIOM_ZERO_MARKETPLACE_URL}
- Gas cost per transaction on Arbitrum: typically under $0.10
- Admin keys: none — the creators follow the same rules as every participant

## Related Project: Cosmic Signature

Cosmic Signature (${COSMIC_SIGNATURE_URL}) is a procedural on-chain art protocol on Arbitrum built by the same team. Random Walk NFTs have live utility there:

- Anchor a Random Walk NFT on Cosmic Signature — without selling it — to become eligible for Anchored-NFT Stellar Selection, a cycle-end selection where chosen holders receive 1,000 CST (Cosmic Signature Token) and one Cosmic Signature NFT.
- Attach an unused Random Walk NFT to one ETH gesture to receive a one-time 50% reduction of the gesture cost. Each token can grant this discount once.

## Beauty Contest

The beauty score is a community-driven ranking. On the Beauty Contest page (${SITE_URL}/compare), visitors vote between two randomly selected artworks. Votes accumulate into a score per token, so the collection can be browsed by what the community finds most beautiful (${SITE_URL}/gallery?sortBy=beauty).

## Why Collectors Trust It

${charterSection}

## Pages

- Home (museum overview + live vault state): ${SITE_URL}/
- How It Works (full explainer: art, algorithm, game, verification): ${SITE_URL}/how-it-works
- Gallery (browse the full collection, sort by newest or beauty): ${SITE_URL}/gallery
- NFT Detail (per-token artwork, films, seed, provenance): ${SITE_URL}/detail/[id]
- Mint (create a new NFT and take the vault key): ${SITE_URL}/mint
- The Vault (live prize, countdown, keyholder, withdrawal): ${SITE_URL}/vault
- Beauty Contest (vote on pairs): ${SITE_URL}/compare
- Open Source (full generator source + IPFS): ${SITE_URL}/code
- FAQ: ${SITE_URL}/faq
- Random Image Viewer: ${SITE_URL}/random
- Random Video Viewer: ${SITE_URL}/random-video
- Marketplace (external, Axiom Zero): ${AXIOM_ZERO_MARKETPLACE_URL}

## Frequently Asked Questions

${faqSection}

## Community

- Twitter: https://twitter.com/RandomWalkNFT
- Discord: https://discord.gg/bGnPn96Qwt
- GitHub: ${CONTRACTS_GITHUB_URL}
`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600"
    }
  });
}
