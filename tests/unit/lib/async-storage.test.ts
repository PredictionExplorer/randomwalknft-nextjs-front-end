import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import AsyncStorage from "@/stubs/async-storage";

describe("MetaMask AsyncStorage web adapter", () => {
  beforeEach(async () => {
    window.localStorage.clear();
    await AsyncStorage.clear();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await AsyncStorage.clear();
    window.localStorage.clear();
  });

  it("round-trips values and supports multi-key operations", async () => {
    await AsyncStorage.multiSet([
      ["session", "connected"],
      ["chain", "42161"]
    ]);

    expect(await AsyncStorage.multiGet(["session", "chain", "missing"])).toEqual([
      ["session", "connected"],
      ["chain", "42161"],
      ["missing", null]
    ]);
    expect(new Set(await AsyncStorage.getAllKeys())).toEqual(
      new Set(["session", "chain"])
    );

    await AsyncStorage.multiRemove(["session", "chain"]);
    expect(await AsyncStorage.getAllKeys()).toEqual([]);
  });

  it("deep-merges JSON objects", async () => {
    await AsyncStorage.setItem(
      "state",
      JSON.stringify({ session: { account: "0x1", chainId: 1 }, keep: true })
    );
    await AsyncStorage.mergeItem(
      "state",
      JSON.stringify({ session: { chainId: 42161 }, added: "yes" })
    );

    expect(JSON.parse((await AsyncStorage.getItem("state")) ?? "{}")).toEqual({
      session: { account: "0x1", chainId: 42161 },
      keep: true,
      added: "yes"
    });
  });

  it("clears only its own namespace", async () => {
    window.localStorage.setItem("unrelated", "keep");
    await AsyncStorage.setItem("session", "remove");

    await AsyncStorage.clear();

    expect(await AsyncStorage.getItem("session")).toBeNull();
    expect(window.localStorage.getItem("unrelated")).toBe("keep");
  });

  it("falls back to tab memory when browser storage rejects writes", async () => {
    window.localStorage.setItem("randomwalk:metamask:session", "stale");
    const setItem = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new DOMException("Storage unavailable", "QuotaExceededError");
      });

    await AsyncStorage.setItem("session", "memory-only");

    expect(await AsyncStorage.getItem("session")).toBe("memory-only");
    setItem.mockRestore();
  });
});
