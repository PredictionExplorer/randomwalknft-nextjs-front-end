import { describe, expect, it } from "vitest";

import {
  buildCollectionSearchParams,
  buildMarketplaceSearchParams,
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
});
