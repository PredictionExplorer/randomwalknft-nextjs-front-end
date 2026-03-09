import { describe, expect, it } from "vitest";

import { createAssetUrls, formatCompactNumber, formatId, getAssetBySelection } from "@/lib/utils";

describe("utils", () => {
  it("formats token ids with left padding", () => {
    expect(formatId(7)).toBe("#000007");
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

  it("formats compact numbers for live stats", () => {
    expect(formatCompactNumber(12)).toBe("12");
    expect(formatCompactNumber(1200)).toMatch(/1\.2K|1.2K/);
  });
});
