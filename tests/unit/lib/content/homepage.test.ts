import { describe, expect, it } from "vitest";

import { homepageCosmicSignature } from "@/lib/content/homepage";

describe("homepageCosmicSignature", () => {
  const sectionText = [
    homepageCosmicSignature.description,
    ...homepageCosmicSignature.utilityCards.map((card) => `${card.title} ${card.body}`),
    ...Object.values(homepageCosmicSignature.definitions)
  ].join("\n");

  it("links to Cosmic Signature", () => {
    expect(homepageCosmicSignature.href).toBe("https://cosmicsignature.com/");
    expect(homepageCosmicSignature.linkLabel).toMatch(/Cosmic Signature/i);
  });

  it("explains Random Walk anchoring and gesture utility", () => {
    expect(sectionText).toMatch(/Random Walk NFT/i);
    expect(sectionText).toMatch(/Anchored-NFT Stellar Selection/i);
    expect(sectionText).toMatch(/50% ETH Gesture Cost reduction/i);
    expect(sectionText).toMatch(/1,000 CST/i);
  });
});
