import { describe, expect, it } from "vitest";

import {
  arbiscanAddressUrl,
  arbiscanContractUrl,
  arbiscanTxUrl,
  createAssetUrls,
  formatCompactNumber,
  formatDateFromUnix,
  formatDateTimeFromUnix,
  formatEth,
  formatId,
  getAssetBySelection,
  getAssetImage,
  getAssetPreview,
  getAssetUrl,
  shortenAddress
} from "@/lib/utils";

describe("utils", () => {
  it("formats token ids with left padding", () => {
    expect(formatId(7)).toBe("#000007");
  });

  it("creates absolute asset urls from NEXT_PUBLIC_ASSET_BASE_URL", () => {
    const urls = createAssetUrls(12);
    expect(urls.blackThumb).toBe(
      "https://assets.test.example.com/randomwalk/000012_black_thumb.jpg"
    );
    expect(urls.whiteSingleVideo).toBe(
      "https://assets.test.example.com/randomwalk/000012_white_single.mp4"
    );
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

  it("builds Arbiscan address URLs", () => {
    expect(arbiscanAddressUrl("0xabc")).toBe("https://arbiscan.io/address/0xabc");
  });

  it("builds Arbiscan contract URLs", () => {
    expect(arbiscanContractUrl("0xdef")).toBe("https://arbiscan.io/address/0xdef#code");
  });

  it("builds Arbiscan transaction URLs", () => {
    expect(arbiscanTxUrl("0x123")).toBe("https://arbiscan.io/tx/0x123");
  });

  it("shortens addresses with default length", () => {
    expect(shortenAddress("0x1234567890abcdef1234567890abcdef12345678")).toBe("0x1234...5678");
  });

  it("shortens addresses with custom length", () => {
    expect(shortenAddress("0x1234567890abcdef1234567890abcdef12345678", 6)).toBe("0x123456...345678");
  });

  it("formats ETH values with default fraction digits", () => {
    expect(formatEth(1.2345)).toBe("1.2345 ETH");
  });

  it("formats ETH values with custom fraction digits", () => {
    expect(formatEth(1.2345, 2)).toBe("1.23 ETH");
  });

  it("formats unix timestamps as dates", () => {
    // 1704110400 = Jan 1 2024 12:00 UTC (stable across timezones)
    expect(formatDateFromUnix(1704110400)).toMatch(/January 1, 2024/);
  });

  it("formats unix timestamps as date-time", () => {
    expect(formatDateTimeFromUnix(1704110400)).toMatch(/Jan 1, 2024/);
  });

  it("builds asset URLs from file names", () => {
    const url = getAssetUrl("000001_black.png");
    expect(url).toMatch(/\/000001_black\.png$/);
  });

  it("selects black theme assets for all variants", () => {
    const urls = createAssetUrls(1);
    expect(getAssetBySelection(urls, "black", "image")).toContain("black.png");
    expect(getAssetBySelection(urls, "black", "singleVideo")).toContain("black_single.mp4");
    expect(getAssetBySelection(urls, "black", "tripleVideo")).toContain("black_triple.mp4");
  });

  it("selects white theme assets for all variants", () => {
    const urls = createAssetUrls(1);
    expect(getAssetBySelection(urls, "white", "image")).toContain("white.png");
    expect(getAssetBySelection(urls, "white", "singleVideo")).toContain("white_single.mp4");
    expect(getAssetBySelection(urls, "white", "tripleVideo")).toContain("white_triple.mp4");
  });

  it("returns black or white thumb for preview", () => {
    const urls = createAssetUrls(1);
    expect(getAssetPreview(urls, "black")).toContain("black_thumb");
    expect(getAssetPreview(urls, "white")).toContain("white_thumb");
  });

  it("returns black or white image", () => {
    const urls = createAssetUrls(1);
    expect(getAssetImage(urls, "black")).toContain("black.png");
    expect(getAssetImage(urls, "white")).toContain("white.png");
  });
});
