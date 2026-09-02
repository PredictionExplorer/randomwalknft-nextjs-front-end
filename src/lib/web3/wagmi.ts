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
 * One config for both runtimes: the server uses it to deserialize wagmi's cookie
 * state during SSR, the browser drives connections with it.
 */
export function getWagmiConfig(): Config {
  configSingleton ??= createAppWagmiConfig();
  return configSingleton;
}
