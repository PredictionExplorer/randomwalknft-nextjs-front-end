# Random Walk NFT

Next.js Front-end for https://randomwalknft.com

## Wallet compatibility

The wallet layer is wagmi 3 with an app-owned connect dialog (`src/components/wallet/`); there is
no RainbowKit and no WalletConnect connector. It supports:

- The MetaMask browser extension and every other EIP-6963 wallet the browser announces, over plain
  EIP-1193 (no SDK download for extension users).
- MetaMask Mobile through wagmi's `metaMask` connector (`@metamask/connect-evm`): deep links on
  phones, and a QR code rendered inside the site's own dialog for desktops without the extension.
- MetaMask's in-app browser, plus an "Open this page in MetaMask" fallback when a mobile attempt
  stalls.
- A generic injected-provider entry for legacy browsers that expose `window.ethereum` without
  EIP-6963.

`NEXT_PUBLIC_SITE_URL` must be the canonical HTTPS origin in non-local environments because it is
included in the MetaMask dapp metadata. No WalletConnect/Reown project ID is used.

`src/lib/web3/wallets/meta-mask-wallet.ts` wraps the stock connector so that (a) an installed
extension is not claimed by the SDK connector and (b) anonymous visitors never load the SDK just to
probe for a session that cannot exist.

## MetaMask Mobile release check

Automated tests cover the production RainbowKit modal, injected-provider events, mobile layouts,
network recovery, storage, and app foregrounding. Before a wallet-related release, also verify on
real devices:

1. iOS Safari → MetaMask → approve → return to Safari.
2. Android Chrome → MetaMask → approve → return to Chrome.
3. MetaMask's in-app browser.
4. Connect, reject, reconnect, switch/add Arbitrum, sign a vote, and submit each transaction flow.
5. Background the browser during approval, then confirm the account and pending receipt recover
   without a reload.
