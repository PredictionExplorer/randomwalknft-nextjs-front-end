import { describe, expect, it } from "vitest";

import { AXIOM_ZERO_MARKETPLACE_URL } from "@/lib/config";
import { navItems } from "@/lib/content/nav";

describe("navItems", () => {
  it("points Marketplace to Axiom Zero", () => {
    expect(navItems).toContainEqual({
      title: "Marketplace",
      href: AXIOM_ZERO_MARKETPLACE_URL
    });
  });

  it("does not expose retired trading history navigation", () => {
    const serialized = JSON.stringify(navItems);

    expect(serialized).not.toContain("/trading");
    expect(serialized).not.toContain("Trading History");
  });
});
