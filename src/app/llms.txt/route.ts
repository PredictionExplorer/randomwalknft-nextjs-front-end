import { NextResponse } from "next/server";

import { getVaultState } from "@/lib/api/public";
import { AXIOM_ZERO_MARKETPLACE_URL, CONTRACTS_GITHUB_URL, COSMIC_SIGNATURE_URL } from "@/lib/config";
import { getAppConfig } from "@/lib/server/app-config";

export async function GET() {
  const { NFT_ADDRESS, SITE_DESCRIPTION, SITE_NAME, SITE_URL } = await getAppConfig();
  const vault = await getVaultState().catch(() => null);
  const asOf = new Date().toISOString().slice(0, 10);

  const liveFacts = vault
    ? `
## Live State (as of ${asOf})

- Works minted: ${vault.mintedCount.toLocaleString("en-US")}
- Current mint price: ${vault.mintPriceEth?.toFixed(4) ?? "unknown"} ETH
- Vault prize (claimable by last minter): ${vault.prizeEth.toFixed(2)} ETH
- Days until the last minter can withdraw: ${(vault.secondsUntilWithdrawal / 86_400).toFixed(1)}
- Times the vault has ever been claimed: ${vault.numWithdrawals}
`
    : "";

  const content = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

## About

Random Walk NFT is a generative art collection and an on-chain game, live on Arbitrum (Ethereum Layer 2) since 2021. Each mint creates a unique on-chain seed; an open-source SHA3-256 random walk algorithm turns that seed into six artworks (one still image and two films, each on black and white backgrounds). All artwork is CC0 (public domain).

## The Vault Game (exact rules)

- All ETH paid for minting goes into the smart contract; the creators take 0%.
- The most recent minter is the "keyholder".
- If 30 days pass without a new mint, the keyholder may withdraw HALF of all ETH in the contract.
- Any new mint resets the 30-day clock and makes the new minter the keyholder.
- After a withdrawal, the remaining half stays in the contract and the game continues.
- The mint price rises about 0.1% per mint (doubling roughly every 693 mints); there is no supply cap.
- The prize therefore stays several hundred times the current mint price (roughly 400x-450x).
- The contract is immutable: no admin keys, no upgrades, nobody can change the rules.
${liveFacts}
## Key Facts

- Blockchain: Arbitrum One (Ethereum L2), chain id 42161
- NFT contract (verified): ${NFT_ADDRESS}
- Launched: 2021
- License: CC0 Public Domain
- Contract source: ${CONTRACTS_GITHUB_URL}
- Secondary marketplace: ${AXIOM_ZERO_MARKETPLACE_URL}
- Art generation: open-source Python program (SHA3-256 seed stream, four-direction walk, drifting RGB channels), stored on IPFS

## Related Project: Cosmic Signature

Random Walk NFTs have live utility in Cosmic Signature (${COSMIC_SIGNATURE_URL}), an on-chain art protocol on Arbitrum by the same team. Holders can anchor a Random Walk NFT there (without selling it) to become eligible for Stellar Selection rewards of 1,000 CST plus a Cosmic Signature NFT, or attach an unused token to one ETH gesture for a one-time 50% discount.

## Pages

- Home (museum overview + live vault state): ${SITE_URL}/
- How It Works (full explainer: art, algorithm, game): ${SITE_URL}/how-it-works
- Gallery (full collection, sortable by beauty score): ${SITE_URL}/gallery
- Mint (create a new NFT and take the vault key): ${SITE_URL}/mint
- The Vault (live prize, countdown, keyholder, withdrawal): ${SITE_URL}/vault
- Beauty Contest (community voting): ${SITE_URL}/compare
- Open Source (full generator source + IPFS): ${SITE_URL}/code
- FAQ: ${SITE_URL}/faq
- Random Image Viewer: ${SITE_URL}/random
- Random Video Viewer: ${SITE_URL}/random-video
- Marketplace (external, Axiom Zero): ${AXIOM_ZERO_MARKETPLACE_URL}

## Extended Information

- Full content version: ${SITE_URL}/llms-full.txt
`;

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600"
    }
  });
}
