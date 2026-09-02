import { type Chain, defineChain } from "viem";

import { getRotatedRpcUrl, getRpcUrlsInRotationOrder } from "@/lib/server-rotation";

/**
 * Network preset (CosmicGame-style). Chain IDs are fixed in code — set `NEXT_PUBLIC_NETWORK` only.
 *
 * **Dapp RPC (this app):** `readContract`, `publicClient`, and wagmi reads use
 * `NEXT_PUBLIC_RPC_URL` if set, otherwise the default RPC for that network below.
 *
 * **MetaMask / browser wallets:** Transactions go through the RPC **in the wallet’s network settings**
 * (for local dev that should be your node, e.g. `http://127.0.0.1:8545`, **not** the Next.js dev
 * server). MetaMask often shows **localhost:3000** as the **connected website** (page origin) — that
 * is unrelated to chain RPC. Chain id must match this app (e.g. 31337 for local).
 */
export type NetworkName = "local" | "sepolia" | "mainnet";

type NetworkPreset = {
  chainId: number;
  name: string;
  /** Used when `NEXT_PUBLIC_RPC_URL` is unset (same pattern as CosmicGame). */
  defaultRpcUrl: string;
  defaultExplorerUrl: string;
  /** Canonical Multicall3 deployment, when the network has one (lets viem batch reads). */
  multicall3?: `0x${string}`;
};

const MULTICALL3_ADDRESS = "0xcA11bde05977b3631167028862bE2a173976CA11" as const;

const NETWORK_PRESETS: Record<NetworkName, NetworkPreset> = {
  local: {
    chainId: 31337,
    name: "Hardhat Local",
    defaultRpcUrl: "http://127.0.0.1:8545",
    defaultExplorerUrl: "http://localhost"
  },
  sepolia: {
    chainId: 421614,
    name: "Arbitrum Sepolia",
    defaultRpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
    defaultExplorerUrl: "https://sepolia.arbiscan.io",
    multicall3: MULTICALL3_ADDRESS
  },
  mainnet: {
    chainId: 42161,
    name: "Arbitrum One",
    defaultRpcUrl: "https://arb1.arbitrum.io/rpc",
    defaultExplorerUrl: "https://arbiscan.io",
    multicall3: MULTICALL3_ADDRESS
  }
};

let cachedChain: Chain | null = null;
/** RPC order the cached chain was built with; a rotation change invalidates it. */
let cachedChainRpcKey: string | null = null;

export function getCurrentNetworkName(): NetworkName {
  const n = (process.env.NEXT_PUBLIC_NETWORK || "local").toLowerCase();
  if (n === "sepolia" || n === "mainnet" || n === "local") {
    return n;
  }
  return "local";
}

/**
 * JSON-RPC URL for viem/wagmi reads: hourly rotation pick over `NEXT_PUBLIC_RPC_URLS`
 * (or the singular `NEXT_PUBLIC_RPC_URL`), else preset default for `NEXT_PUBLIC_NETWORK`.
 */
export function getRpcHttpUrl(): string {
  const picked = getRotatedRpcUrl();
  if (picked) {
    return picked;
  }
  return NETWORK_PRESETS[getCurrentNetworkName()].defaultRpcUrl;
}

/**
 * All configured JSON-RPC URLs with the current hourly pick first — feed this to a viem
 * `fallback()` transport so requests prefer the rotation pick and automatically fail over
 * to the remaining servers.
 */
export function getRpcHttpUrls(): string[] {
  const ordered = getRpcUrlsInRotationOrder();
  if (ordered.length > 0) {
    return ordered;
  }
  return [NETWORK_PRESETS[getCurrentNetworkName()].defaultRpcUrl];
}

/** Base URL for block explorer links (no trailing slash). Override with `NEXT_PUBLIC_BLOCK_EXPLORER_URL`. */
export function getExplorerBaseUrl(): string {
  const override = process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL?.trim();
  if (override) {
    return override.replace(/\/+$/, "");
  }
  return NETWORK_PRESETS[getCurrentNetworkName()].defaultExplorerUrl;
}

/**
 * Chain used by viem + wagmi. Id and name come from the `NEXT_PUBLIC_NETWORK` preset, not from env.
 * The object is memoized per RPC rotation order, so the same reference is returned within an hour
 * (stable for React/wagmi) and a fresh one once the hourly pick moves.
 */
export function getConfiguredEvmChain(): Chain {
  const rpcs = getRpcHttpUrls();
  const rpcKey = rpcs.join("|");
  if (cachedChain && cachedChainRpcKey === rpcKey) {
    return cachedChain;
  }
  const net = getCurrentNetworkName();
  const preset = NETWORK_PRESETS[net];
  const explorer = getExplorerBaseUrl();

  cachedChain = defineChain({
    id: preset.chainId,
    name: preset.name,
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: {
      default: { http: rpcs }
    },
    blockExplorers: {
      default: { name: "Explorer", url: explorer }
    },
    ...(preset.multicall3 ? { contracts: { multicall3: { address: preset.multicall3 } } } : {})
  });
  cachedChainRpcKey = rpcKey;
  return cachedChain;
}

/** Human-readable network name for UI copy (wallet prompts, etc.). */
export function getChainDisplayName(): string {
  return getConfiguredEvmChain().name;
}
