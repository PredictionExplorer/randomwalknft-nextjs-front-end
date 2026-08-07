// @vitest-environment node

import { describe, expect, it } from "vitest";

describe("wagmi config server compatibility", () => {
  it("can be imported in a server (node) environment without error", async () => {
    const mod = await import("@/lib/web3/wagmi");
    const cfg = mod.getServerWagmiConfig();
    expect(cfg).toBeDefined();
    expect(cfg.chains).toHaveLength(1);
    expect(cfg.chains[0]?.id).toBe(42161);
  });

  it("registers MetaMask SDK and injected connectors without WalletConnect", async () => {
    const mod = await import("@/lib/web3/wagmi-client");
    const connectorIds = mod.getWagmiConfig().connectors.map((connector) => connector.id);

    expect(connectorIds).toEqual(expect.arrayContaining(["metaMaskSDK", "injected"]));
    expect(connectorIds.some((id) => id.toLowerCase().includes("walletconnect"))).toBe(false);
  });
});
