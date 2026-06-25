import { describe, expect, it } from "vitest";

import {
  buildCollectionSearchParams,
  getCollectionViewLabel,
  parseCollectionQueryState
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
      parseCollectionQueryState({ query: "0" })
    ).toMatchObject({ query: 0 });
  });

  it("treats empty query string as undefined, not zero", () => {
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

});
