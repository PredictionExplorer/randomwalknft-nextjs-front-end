import { describe, expect, it } from "vitest";

import { tokenDescription, tokenJsonLd, tokenTitle } from "@/lib/seo/token-metadata";
import type { Nft } from "@/lib/types";
import { createAssetUrls } from "@/lib/utils";

function buildNft(overrides: Partial<Nft> = {}): Nft {
  return {
    id: 42,
    name: "",
    seed: "0x" + "ab".repeat(32),
    owner: "0x1111111111111111111111111111111111111111",
    mintedAt: "2021-11-12T01:52:00.000Z",
    assets: createAssetUrls(42),
    tokenHistory: [],
    ...overrides
  };
}

describe("token metadata", () => {
  it("titles named and unnamed works differently", () => {
    expect(tokenTitle(buildNft())).toBe("NFT #000042");
    expect(tokenTitle(buildNft({ name: "Drift" }))).toBe("#000042 “Drift”");
  });

  it("writes a unique description with the seed, mint date, and name", () => {
    const description = tokenDescription(buildNft({ name: "Drift" }));
    expect(description).toContain("#000042");
    expect(description).toContain("0xabababab");
    expect(description).toContain("Minted 2021-11-12");
    expect(description).toContain("Named “Drift”");
  });

  it("describes a freshly minted token as still rendering", () => {
    expect(tokenDescription(buildNft({ isPendingMetadata: true }))).toMatch(/being generated now/);
  });

  it("emits VisualArtwork JSON-LD with films only once the media exists", () => {
    const ready = tokenJsonLd({
      nft: buildNft(),
      siteName: "Random Walk NFT",
      siteUrl: "https://randomwalknft.com",
      contractAddress: "0xcontract",
      beautyRank: 3
    });
    expect(ready["@type"]).toBe("VisualArtwork");
    expect(ready.url).toBe("https://randomwalknft.com/detail/42");
    expect(ready.identifier).toContainEqual({ "@type": "PropertyValue", name: "Beauty rank", value: "3" });
    expect(ready.associatedMedia).toHaveLength(2);
    expect(ready.dateCreated).toBe("2021-11-12T01:52:00.000Z");

    const pending = tokenJsonLd({
      nft: buildNft({ isPendingMetadata: true, mintedAt: undefined }),
      siteName: "Random Walk NFT",
      siteUrl: "https://randomwalknft.com",
      contractAddress: "0xcontract",
      beautyRank: undefined
    });
    expect(pending.associatedMedia).toBeUndefined();
    expect(pending.dateCreated).toBeUndefined();
    expect(pending.identifier.some((entry) => entry.name === "Beauty rank")).toBe(false);
  });
});
