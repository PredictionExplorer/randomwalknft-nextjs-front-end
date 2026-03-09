import { describe, expect, it } from "vitest";

import {
  buildCollectionSearchParams,
  buildMarketplaceSearchParams,
  getCollectionViewLabel,
  parseCollectionQueryState,
  parseMarketplaceQueryState
} from "@/lib/query-state";

describe("query-state helpers", () => {
  it("parses collection query state with safe defaults", () => {
    expect(parseCollectionQueryState({})).toEqual({
      address: undefined,
      page: 1,
      query: undefined,
      sortBy: "tokenId",
      view: "gallery"
    });
  });

  it("builds collection params without default noise", () => {
    const params = buildCollectionSearchParams({
      address: "0xabc",
      page: 2,
      query: 42,
      sortBy: "beauty",
      view: "compact"
    });

    expect(params.toString()).toBe("address=0xabc&query=42&sortBy=beauty&page=2&view=compact");
  });

  it("parses marketplace query state", () => {
    expect(
      parseMarketplaceQueryState({
        filter: "buy",
        sort: "recent",
        min: "0.1",
        max: "1.5",
        query: "7"
      })
    ).toEqual({
      filter: "buy",
      sort: "recent",
      min: 0.1,
      max: 1.5,
      query: 7
    });
  });

  it("builds marketplace params without default values", () => {
    const params = buildMarketplaceSearchParams({
      filter: "sell",
      sort: "price-asc",
      min: undefined,
      max: undefined,
      query: undefined
    });

    expect(params.toString()).toBe("");
  });

  it("preserves non-default marketplace params when building query strings", () => {
    const params = buildMarketplaceSearchParams({
      filter: "buy",
      sort: "recent",
      min: 0.2,
      max: 2,
      query: 7
    });

    expect(params.toString()).toBe("filter=buy&sort=recent&min=0.2&max=2&query=7");
  });

  it("falls back to safe marketplace defaults for invalid input", () => {
    expect(
      parseMarketplaceQueryState({
        filter: "unexpected",
        sort: "bogus",
        min: "-1",
        max: "NaN",
        query: "-5"
      })
    ).toEqual({
      filter: "sell",
      sort: "price-asc",
      min: undefined,
      max: undefined,
      query: undefined
    });
  });

  it("returns undefined for whitespace-only min/max", () => {
    expect(
      parseMarketplaceQueryState({ filter: "sell", sort: "price-asc", min: "  " })
    ).toMatchObject({ min: undefined });
    expect(
      parseMarketplaceQueryState({ filter: "sell", sort: "price-asc", max: "\t" })
    ).toMatchObject({ max: undefined });
  });

  it("returns human-readable collection view labels", () => {
    expect(getCollectionViewLabel("compact")).toBe("Compact");
    expect(getCollectionViewLabel("gallery")).toBe("Gallery");
  });

  it("omits default collection params from search string", () => {
    const params = buildCollectionSearchParams({
      page: 1,
      query: undefined,
      sortBy: "tokenId",
      view: "gallery"
    });
    expect(params.toString()).toBe("");
  });

  it("parses collection state with beauty sort and compact view", () => {
    expect(
      parseCollectionQueryState({ sortBy: "beauty", view: "compact", page: "3" })
    ).toMatchObject({ sortBy: "beauty", view: "compact", page: 3 });
  });

  it("parses collection state with array values gracefully", () => {
    expect(
      parseCollectionQueryState({ address: ["a", "b"], query: ["1"], page: ["2"] })
    ).toMatchObject({ address: undefined, query: undefined, page: 1 });
  });

  it("handles parsePositiveNumber with valid zero", () => {
    expect(
      parseMarketplaceQueryState({ filter: "sell", sort: "price-asc", min: "0" })
    ).toMatchObject({ min: 0 });
  });

  it("treats empty query string as undefined, not zero", () => {
    expect(
      parseMarketplaceQueryState({ filter: "sell", sort: "price-asc", query: "" })
    ).toMatchObject({ query: undefined });
    expect(
      parseCollectionQueryState({ query: "" })
    ).toMatchObject({ query: undefined });
  });

  it("includes address in collection params only when set", () => {
    const withAddress = buildCollectionSearchParams({
      address: "0xabc",
      page: 1,
      query: undefined,
      sortBy: "tokenId",
      view: "gallery"
    });
    expect(withAddress.get("address")).toBe("0xabc");

    const withoutAddress = buildCollectionSearchParams({
      address: undefined,
      page: 1,
      query: undefined,
      sortBy: "tokenId",
      view: "gallery"
    });
    expect(withoutAddress.get("address")).toBeNull();
  });

  it("parses marketplace price-desc sort", () => {
    expect(
      parseMarketplaceQueryState({ filter: "sell", sort: "price-desc" })
    ).toMatchObject({ sort: "price-desc" });
  });
});
