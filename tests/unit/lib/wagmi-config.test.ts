// @vitest-environment node

import { describe, expect, it } from "vitest";

describe("wagmi config server compatibility", () => {
  it("can be imported in a server (node) environment without error", async () => {
    const mod = await import("@/lib/web3/wagmi");
    expect(mod.wagmiConfig).toBeDefined();
    expect(mod.wagmiConfig.chains).toHaveLength(1);
    expect(mod.wagmiConfig.chains[0]?.id).toBe(42161);
  });

  it("exports walletConnectProjectId as a string", async () => {
    const mod = await import("@/lib/web3/wagmi");
    expect(typeof mod.walletConnectProjectId).toBe("string");
  });
});
