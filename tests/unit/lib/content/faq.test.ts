import { describe, expect, it } from "vitest";

import { AXIOM_ZERO_MARKETPLACE_URL } from "@/lib/config";
import { faqItems } from "@/lib/content/faq";

describe("faqItems", () => {
  const faqText = faqItems.map((item) => `${item.summary} ${item.detail}`).join("\n");

  it("sends secondary marketplace questions to Axiom Zero", () => {
    expect(faqText).toContain(AXIOM_ZERO_MARKETPLACE_URL);
    expect(faqText).toContain("Axiom Zero");
  });

  it("does not describe the retired built-in marketplace workflow", () => {
    expect(faqText).not.toMatch(/built-in marketplace/i);
    expect(faqText).not.toMatch(/zero-fee marketplace/i);
    expect(faqText).not.toMatch(/click List/i);
    expect(faqText).not.toMatch(/Buyers can also make offers/i);
  });
});
