import {
  cookieStorage,
  createConfig,
  createStorage
} from "wagmi";
import type { Config, CreateConnectorFn } from "wagmi";
import { injected, metaMask } from "wagmi/connectors";

import { getConfiguredEvmChain } from "@/lib/web3/evm-chain";
import { getRpcTransport } from "@/lib/web3/rpc-transport";
import { getMetaMaskParameters } from "@/lib/web3/wallets/meta-mask-parameters";

let serverWagmiConfigSingleton: Config | undefined;

export function createAppWagmiConfig(connectors: CreateConnectorFn[]): Config {
  const chain = getConfiguredEvmChain();
  return createConfig({
    chains: [chain],
    connectors,
    ssr: true,
    storage: createStorage({ storage: cookieStorage }),
    transports: {
      [chain.id]: getRpcTransport()
    }
  });
}

/**
 * Server Components cannot call RainbowKit's client-only connector builder.
 * Use connector factories with matching IDs solely to deserialize Wagmi's
 * cookie state; the browser config adds RainbowKit metadata.
 */
export function getServerWagmiConfig(): Config {
  if (!serverWagmiConfigSingleton) {
    serverWagmiConfigSingleton = createAppWagmiConfig([
      metaMask(getMetaMaskParameters()),
      injected({ shimDisconnect: true })
    ]);
  }

  return serverWagmiConfigSingleton;
}
