# Random Walk NFT

Next.js Front-end for https://randomwalknft.com

## Wallet compatibility

The app intentionally does not register a WalletConnect connector. It supports:

- MetaMask browser extensions and MetaMask Mobile through the Wagmi 2 MetaMask SDK connector.
- Installed EIP-6963 browser wallets, with a generic injected-provider fallback.
- MetaMask's in-app browser and MetaMask deep links from iOS Safari or Android Chrome.

`NEXT_PUBLIC_SITE_URL` must be the canonical HTTPS origin in non-local environments because it is
included in wallet metadata. No WalletConnect/Reown project ID is used.

The Wagmi 2 MetaMask SDK is deprecated upstream. It remains isolated behind
`src/lib/web3/wallets/meta-mask-sdk-wallet.ts` until a later Wagmi 3 migration. Without
WalletConnect, a desktop browser that has no wallet extension does not have a QR-to-mobile fallback.

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