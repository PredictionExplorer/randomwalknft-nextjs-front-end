import { arbitrum } from "wagmi/chains";
import {
  cookieStorage,
  createConfig,
  createStorage,
  http
} from "wagmi";
import { injected } from "wagmi/connectors";

export const wagmiConfig = createConfig({
  chains: [arbitrum],
  multiInjectedProviderDiscovery: false,
  connectors: [injected()],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage
  }),
  transports: {
    [arbitrum.id]: http()
  }
});
