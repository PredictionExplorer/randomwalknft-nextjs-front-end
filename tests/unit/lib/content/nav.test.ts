import { describe, expect, it } from "vitest";

import { AXIOM_ZERO_MARKETPLACE_URL } from "@/lib/config";
import { navItems } from "@/lib/content/nav";

describe("navItems", () => {
  it("leads with the rooms a visitor needs most", () => {
    expect(navItems.slice(0, 4).map((item) => item.href)).toEqual(["/gallery", "/atelier", "/vault", "/mint"]);
  });

  it("points Marketplace to Axiom Zero under Discover", () => {
    const discover = navItems.find((item) => "children" in item);
    expect(discover && "children" in discover ? discover.children : []).toContainEqual({
      title: "Marketplace",
      href: AXIOM_ZERO_MARKETPLACE_URL
    });
  });

  it("does not expose retired trading history navigation", () => {
    const serialized = JSON.stringify(navItems);

    expect(serialized).not.toContain("/trading");
    expect(serialized).not.toContain("Trading History");
    expect(serialized).not.toContain("/redeem");
  });
});
