import { type Chain, defineChain } from "viem";

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
};

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
    defaultExplorerUrl: "https://sepolia.arbiscan.io"
  },
  mainnet: {
    chainId: 42161,
    name: "Arbitrum One",
    defaultRpcUrl: "https://arb1.arbitrum.io/rpc",
    defaultExplorerUrl: "https://arbiscan.io"
  }
};

let cachedChain: Chain | null = null;

export function getCurrentNetworkName(): NetworkName {
  const n = (process.env.NEXT_PUBLIC_NETWORK || "local").toLowerCase();
  if (n === "sepolia" || n === "mainnet" || n === "local") {
    return n;
  }
  return "local";
}

/** JSON-RPC URL for viem/wagmi reads: env override, else preset default for `NEXT_PUBLIC_NETWORK`. */
export function getRpcHttpUrl(): string {
  const custom = process.env.NEXT_PUBLIC_RPC_URL?.trim();
  if (custom) {
    return custom;
  }
  return NETWORK_PRESETS[getCurrentNetworkName()].defaultRpcUrl;
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
 */
export function getConfiguredEvmChain(): Chain {
  if (cachedChain) {
    return cachedChain;
  }
  const net = getCurrentNetworkName();
  const preset = NETWORK_PRESETS[net];
  const rpc = getRpcHttpUrl();
  const explorer = getExplorerBaseUrl();

  cachedChain = defineChain({
    id: preset.chainId,
    name: preset.name,
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: {
      default: { http: [rpc] }
    },
    blockExplorers: {
      default: { name: "Explorer", url: explorer }
    }
  });
  return cachedChain;
}

/** Human-readable network name for UI copy (wallet prompts, etc.). */
export function getChainDisplayName(): string {
  return getConfiguredEvmChain().name;
}
