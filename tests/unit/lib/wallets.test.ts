import { describe, expect, it } from "vitest";

import { getWalletDescription, getWalletLabel, getWalletOptions } from "@/lib/web3/wallets";

describe("wallet helpers", () => {
  it("maps generic injected connectors to a user-friendly browser wallet label", () => {
    expect(getWalletLabel({ uid: "1", id: "injected", name: "Injected" })).toBe("Browser Wallet");
    expect(getWalletDescription({ uid: "1", id: "injected", name: "Injected" })).toMatch(/installed wallet extension/i);
  });

  it("preserves well-known wallet branding", () => {
    expect(getWalletLabel({ uid: "1", id: "metaMask", name: "MetaMask" })).toBe("MetaMask");
    expect(getWalletLabel({ uid: "2", id: "coinbaseWallet", name: "Coinbase Wallet" })).toBe("Coinbase Wallet");
  });

  it("deduplicates visually duplicate wallet options", () => {
    const options = getWalletOptions([
      { uid: "a", id: "injected", name: "Injected" },
      { uid: "b", id: "metaMask", name: "MetaMask" },
      { uid: "c", id: "metaMask", name: "MetaMask" }
    ]);

    expect(options.map((option) => option.label)).toEqual(["Browser Wallet", "MetaMask"]);
  });
});
