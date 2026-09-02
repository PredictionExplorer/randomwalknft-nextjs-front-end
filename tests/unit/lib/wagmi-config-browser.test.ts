import { describe, expect, it } from "vitest";

describe("wagmi config in the browser", () => {
  it("keeps one shared config so wallet state survives re-renders", async () => {
    const { getWagmiConfig } = await import("@/lib/web3/wagmi");
    const config = getWagmiConfig();

    expect(typeof window).toBe("object");
    expect(getWagmiConfig()).toBe(config);
  });
});
