import { describe, expect, it } from "vitest";

function computeMarketplaceStats(offers: { price: number }[]) {
  const lowestPrice = offers.length ? Math.min(...offers.map((o) => o.price)) : undefined;
  const highestPrice = offers.length ? Math.max(...offers.map((o) => o.price)) : undefined;
  return { lowestPrice, highestPrice };
}

describe("marketplace stats", () => {
  it("returns correct lowest and highest when sorted by price ascending", () => {
    const offers = [{ price: 0.5 }, { price: 1.2 }, { price: 3.0 }];
    const { lowestPrice, highestPrice } = computeMarketplaceStats(offers);
    expect(lowestPrice).toBe(0.5);
    expect(highestPrice).toBe(3.0);
  });

  it("returns correct lowest and highest when sorted by price descending", () => {
    const offers = [{ price: 3.0 }, { price: 1.2 }, { price: 0.5 }];
    const { lowestPrice, highestPrice } = computeMarketplaceStats(offers);
    expect(lowestPrice).toBe(0.5);
    expect(highestPrice).toBe(3.0);
  });

  it("returns correct lowest and highest when sorted by recent (arbitrary order)", () => {
    const offers = [{ price: 1.2 }, { price: 3.0 }, { price: 0.5 }, { price: 2.0 }];
    const { lowestPrice, highestPrice } = computeMarketplaceStats(offers);
    expect(lowestPrice).toBe(0.5);
    expect(highestPrice).toBe(3.0);
  });

  it("returns undefined for both when offers is empty", () => {
    const { lowestPrice, highestPrice } = computeMarketplaceStats([]);
    expect(lowestPrice).toBeUndefined();
    expect(highestPrice).toBeUndefined();
  });

  it("handles a single offer correctly", () => {
    const { lowestPrice, highestPrice } = computeMarketplaceStats([{ price: 1.5 }]);
    expect(lowestPrice).toBe(1.5);
    expect(highestPrice).toBe(1.5);
  });
});
