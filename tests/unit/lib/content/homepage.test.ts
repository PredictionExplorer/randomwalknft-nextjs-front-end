import { describe, expect, it } from "vitest";

import { homepageAnnex, homepageCharter } from "@/lib/content/homepage";

describe("homepageAnnex (Cosmic Signature)", () => {
  const sectionText = [
    homepageAnnex.body,
    ...homepageAnnex.cards.map((card) => `${card.title} ${card.body}`)
  ].join("\n");

  it("links to Cosmic Signature with descriptive anchor text", () => {
    expect(homepageAnnex.href).toBe("https://cosmicsignature.com/");
    expect(homepageAnnex.linkLabel).toMatch(/use your random walk nft in cosmic signature/i);
  });

  it("explains both utilities: anchoring rewards and the gesture discount", () => {
    expect(sectionText).toMatch(/anchor/i);
    expect(sectionText).toMatch(/1,000 CST/i);
    expect(sectionText).toMatch(/50%/);
    expect(sectionText).toMatch(/Cosmic Signature NFT/i);
  });
});

describe("homepageCharter", () => {
  const charterText = homepageCharter.map((item) => `${item.title} ${item.body}`).join("\n");

  it("covers the four standing guarantees", () => {
    expect(homepageCharter).toHaveLength(4);
    expect(charterText).toMatch(/no admin keys/i);
    expect(charterText).toMatch(/CC0/);
    expect(charterText).toMatch(/IPFS/);
    expect(charterText).toMatch(/creators take nothing|take nothing from minting/i);
  });

  it("links to the verified contract on Arbiscan", () => {
    const arbiscanLink = homepageCharter.find((item) => item.href?.includes("arbiscan.io"));
    expect(arbiscanLink?.href).toContain("0x895a6F444BE4ba9d124F61DF736605792B35D66b");
  });
});
