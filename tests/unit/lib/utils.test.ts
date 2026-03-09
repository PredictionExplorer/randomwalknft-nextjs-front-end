import { describe, expect, it } from "vitest";

import { createAssetUrls, formatId, getAssetBySelection, slugify } from "@/lib/utils";

describe("utils", () => {
  it("formats token ids with left padding", () => {
    expect(formatId(7)).toBe("#000007");
  });

  it("slugifies titles for blog routes", () => {
    expect(slugify("Hello World! 2026")).toBe("hello-world-2026");
  });

  it("creates proxied asset urls", () => {
    const urls = createAssetUrls(12);
    expect(urls.blackThumb).toContain("/api/assets/000012_black_thumb.jpg");
    expect(urls.whiteSingleVideo).toContain("/api/assets/000012_white_single.mp4");
  });

  it("selects the requested themed asset", () => {
    const urls = createAssetUrls(12);
    expect(getAssetBySelection(urls, "black", "singleVideo")).toContain("black_single.mp4");
    expect(getAssetBySelection(urls, "white", "image")).toContain("white.png");
  });
});
