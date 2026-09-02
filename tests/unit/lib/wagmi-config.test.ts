// @vitest-environment node

import { describe, expect, it } from "vitest";

describe("wagmi config", () => {
  it("can be created in a server (node) environment for cookie hydration", async () => {
    const { getWagmiConfig } = await import("@/lib/web3/wagmi");
    const config = getWagmiConfig();

    expect(config.chains).toHaveLength(1);
    expect(config.chains[0]?.id).toBe(42161);
    expect(getWagmiConfig()).toBe(config);
  });

  it("registers MetaMask and the generic injected connector, and never WalletConnect", async () => {
    const { createAppWagmiConfig } = await import("@/lib/web3/wagmi");
    const connectorIds = createAppWagmiConfig().connectors.map((connector) => connector.id);

    expect(connectorIds).toEqual(expect.arrayContaining(["metaMaskSDK", "injected"]));
    expect(connectorIds.some((id) => id.toLowerCase().includes("walletconnect"))).toBe(false);
  });
});
