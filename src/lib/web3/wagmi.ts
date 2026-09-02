import { cookieStorage, createConfig, createStorage, type Config } from "wagmi";
import { injected } from "wagmi/connectors";

import { getConfiguredEvmChain } from "@/lib/web3/evm-chain";
import { getRpcTransport } from "@/lib/web3/rpc-transport";
import { metaMaskWallet } from "@/lib/web3/wallets/meta-mask-wallet";

let configSingleton: Config | undefined;

export function createAppWagmiConfig(): Config {
  const chain = getConfiguredEvmChain();
  return createConfig({
    chains: [chain],
    // MetaMask (extension or mobile via the SDK) plus any EIP-6963 wallet the
    // browser announces. WalletConnect is intentionally absent.
    connectors: [metaMaskWallet(), injected({ shimDisconnect: true })],
    multiInjectedProviderDiscovery: true,
    ssr: true,
    storage: createStorage({ storage: cookieStorage }),
    transports: {
      [chain.id]: getRpcTransport()
    }
  });
}

/**
 * One config shape for both runtimes. The browser keeps a singleton so wallet
 * state survives re-renders; the server builds a fresh config per call because
 * wagmi's hydrate() mutates the store, and a shared instance would leak one
 * request's connection status into the next visitor's HTML.
 */
export function getWagmiConfig(): Config {
  if (typeof window === "undefined") {
    return createAppWagmiConfig();
  }
  configSingleton ??= createAppWagmiConfig();
  return configSingleton;
}
