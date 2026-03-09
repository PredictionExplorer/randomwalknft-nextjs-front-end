import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MarketplaceToolbar } from "@/components/marketplace/marketplace-toolbar";

describe("MarketplaceToolbar", () => {
  it("surfaces active filters and preserves the current filter on submit", () => {
    render(
      <MarketplaceToolbar
        state={{
          filter: "buy",
          sort: "recent",
          min: 0.2,
          max: 2,
          query: 7
        }}
        totalOffers={12}
      />
    );

    expect(screen.getByText(/12 entries/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /reset/i })).toHaveAttribute("href", "/marketplace");
    expect(screen.getByRole("button", { name: /buy offers/i })).toHaveAttribute("value", "buy");
    expect(screen.getByRole("button", { name: /apply marketplace filters/i })).toHaveAttribute("value", "buy");
    expect(screen.getByText(/token #000007/i)).toBeInTheDocument();
    expect(screen.getByText(/min 0.2 eth/i)).toBeInTheDocument();
    expect(screen.getByText(/max 2 eth/i)).toBeInTheDocument();
    expect(screen.getByText(/most recent first/i)).toBeInTheDocument();
  });
});
