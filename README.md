# Random Walk NFT

The front-end for [randomwalknft.com](https://randomwalknft.com): a generative art collection and
an on-chain game on Arbitrum, presented as a museum with two wings.

- **Next.js 16 (App Router, Cache Components, React Compiler)**, React 19, TypeScript, Tailwind CSS 4.
- **wagmi 3 + viem** with an app-owned wallet layer (no RainbowKit, no WalletConnect).
- **Vitest + Testing Library** for units, **Playwright** for end-to-end, accessibility (axe) and
  visual regression, **Lighthouse CI** for budgets — all runnable offline against a deterministic
  mock of the upstream services.

## Running it

Requires Node 22 (`.nvmrc`) and pnpm via corepack. Every `NEXT_PUBLIC_*` variable in
[`.env.example`](.env.example) must be set in the process environment; the app refuses to start
otherwise (`NEXT_PUBLIC_SITE_URL` must be the canonical HTTPS origin outside `local`).

```bash
corepack pnpm install
export NEXT_PUBLIC_NETWORK=mainnet \
       NEXT_PUBLIC_API_BASE_URL=http://randomwalknft-api.com \
       NEXT_PUBLIC_RPC_URL=https://arb1.arbitrum.io/rpc \
       NEXT_PUBLIC_SITE_URL=https://randomwalknft.com
pnpm dev            # webpack dev server (pnpm dev:turbo for Turbopack)
pnpm build && pnpm start
```

| Script                        | What it does                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------- |
| `pnpm check`                  | lint (type-aware ESLint + jsx-a11y), typecheck, Prettier check, knip (dead code and dependencies) |
| `pnpm test:unit`              | Vitest with coverage; whole-`src` thresholds (88/80/86/89) are enforced                           |
| `pnpm test:e2e:functional`    | public pages, transaction flows, accessibility, wallet, mobile wallet, hydration — all browsers   |
| `pnpm test:e2e:visual`        | pixel baselines for every room in both wings (Chromium, Linux baselines)                          |
| `pnpm test:e2e:visual:update` | regenerates the Linux baselines inside the pinned Playwright Docker image                         |
| `pnpm test:e2e:live`          | smoke run of the public suite against the real API and RPC                                        |
| `pnpm test:lighthouse`        | Lighthouse CI budgets (performance ≥ 0.8, a11y ≥ 0.95, SEO ≥ 0.95, CLS ≤ 0.1) on six rooms        |
| `pnpm test:ci`                | everything above, in order                                                                        |

Husky runs lint-staged (ESLint + Prettier) on commit. Dependabot groups weekly updates.

## How the site is organised

```
src/app                 App Router routes; pages are Server Components that compose islands
src/app/api             Route handlers: /api/vault, /api/compare, /api/random-token, /api/assets proxy
src/components/feature  Islands: WalkStory, ConstellationMap, VaultChapter, MintPanel, AtelierStudio…
src/components/detail   Token page islands: ArtworkStage, TokenNav, CollectorTools, Provenance…
src/components/wallet   ConnectModal, AccountSheet, ChainPrompt, WalletProvider
src/components/ui       Primitives (Radix-based) styled with the design tokens
src/lib/api             Upstream client with failover + timeouts, Zod schemas, cached data functions
src/lib/walk            The generator (walk-engine), incremental painter, story timeline, constellation math
src/lib/web3            wagmi config, connectors, chain presets, RPC rotation, transaction preflight
tests/unit              Vitest suites mirroring src
tests/e2e               Playwright suites, fixtures, the mock upstream, visual baselines
scripts                 visual-baselines.sh (Docker), lighthouse-server.sh
```

### The Walk and the Atelier

The homepage is a scroll-driven story: a pinned stage where the real generator draws a walk as
the visitor scrolls (seed → SHA3 bits → steps → colour → frame). `WalkCanvas` runs the same
algorithm as the published Python generator at miniature resolution; in controlled mode a parent
drives it imperatively through `WalkPainter`, so scroll never triggers React renders. A pure
`story-timeline.ts` maps scroll progress to what is shown and is property-tested. `/atelier`
exposes the generator to visitors (paste a seed, type anything, both editions, download), and every
token page can redraw its own work from its on-chain seed beside the archived render.

### Wings and the design system

Colour tokens live in `globals.css` under `:root` (dark wing) and `:root[data-wing="light"]`. The
wing is a cookie; an inline script in `<head>` applies it to `<html>` before first paint, and
`WingProvider` reads that attribute after hydration so the document shell stays prerenderable.
Every artwork follows the wing (`useArtworkAssets` picks the black or white edition). Type is Geist
Sans/Mono and Instrument Serif, self-hosted through `next/font` with `font-display: fallback`;
motion goes through `motion`'s `LazyMotion` and honours `prefers-reduced-motion` everywhere.

### Data and caching

Cache Components are on. Data functions in `src/lib/api/public.ts` carry `"use cache"` with
explicit lifetimes and tags: the vault read revalidates every 15s (`vault`), token detail per token
(`tokens`, `token-<id>`), the beauty ranking every 30 minutes (`ranking`), the contract addresses
hourly (`contracts`). Work that must be fresh per request (the resampled mint rail, the random
rooms, `?seed`, live route handlers) sits behind `Suspense` with `connection()`. Reads go to the
Go API and the RPC through `src/lib/api/client.ts`, which rotates between configured servers hourly
and fails over on errors and timeouts; `/api/*` routes are rate limited per IP and validated with Zod.

### Wallets

`src/lib/web3/wagmi.ts` registers the MetaMask connector (`@metamask/connect-evm`) and a generic
injected connector, with EIP-6963 discovery for every announced wallet. The MetaMask wrapper
(`wallets/meta-mask-wallet.ts`) does not claim the extension's rdns (extension users connect over
plain EIP-1193 without the SDK), never initialises the SDK without a stored session, and bounds a
stalled SDK so wagmi's reconnect can move on. Wallet state is never rendered on the server; the
client reconnects from wagmi's cookie storage, and `useWalletStatus` reports "disconnected" until
mounted so streamed islands always match their HTML.

Before a wallet-related release, verify on real devices: iOS Safari → MetaMask → back to Safari;
Android Chrome → MetaMask → back to Chrome; MetaMask's in-app browser; connect, reject, reconnect,
switch/add Arbitrum, sign a vote, and each transaction flow; and backgrounding the browser during
approval with the account and pending receipt recovering without a reload.

## Testing strategy

**Unit tests** cover every module and island, including the pure pieces (walk engine, painter, story
timeline, constellation layout, gallery resolver, token metadata) with fast-check properties where
invariants matter. App Router pages are rendered as async functions with mocked data so composition
errors surface without a browser.

**End-to-end tests** run against `tests/e2e/mock-upstream`: a small Node server (TypeScript, run
natively) standing in for the Go API, the asset host, and the Arbitrum JSON-RPC endpoint. It answers
contract reads (including Multicall3), confirms transaction receipts, renders each token's real walk
to PNG from a deterministic seed, and exposes `POST /__mock/state` so scenarios can shape the world
(clock at zero, pending files, a mint about to confirm). Suites:

- `public.spec.ts` — every public room renders and links correctly; axe smoke check.
- `flows.spec.ts` — mint → reveal → fresh token page; keyholder vault claim; signed salon vote;
  My NFTs; owner rename; wing persistence; pending-media notice (Chromium; the flows mutate the
  shared world).
- `a11y.spec.ts` — WCAG 2.1 AA with axe on every room in both wings, focus trap and keyboard checks.
- `wallet.spec.ts`, `wallet-mobile.spec.ts` — connect modal, EIP-6963, network switching, recovery.
- `visual.spec.ts` — full-page baselines in both wings. Baselines are Linux-only so they match the
  pinned Playwright image CI uses; regenerate with `pnpm test:e2e:visual:update` (needs Docker).

Set `E2E_UPSTREAM=live` to point the public suite at the real services (`pnpm test:e2e:live`).

**Lighthouse CI** audits six rooms against the mock-backed build with a crawler-marked user agent,
so streamed metadata is measured the way non-JavaScript crawlers receive it (`htmlLimitedBots`).
