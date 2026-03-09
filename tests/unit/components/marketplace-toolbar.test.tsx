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

  it("renders filter pill badges when filters are applied", () => {
    render(
      <MarketplaceToolbar
        state={{
          filter: "sell",
          sort: "price-desc",
          min: 0.5,
          max: 5,
          query: 42
        }}
        totalOffers={100}
      />
    );
    expect(screen.getByText(/token #000042/i)).toBeInTheDocument();
    expect(screen.getByText(/min 0.5 eth/i)).toBeInTheDocument();
    expect(screen.getByText(/max 5 eth/i)).toBeInTheDocument();
    expect(screen.getByText(/highest price first/i)).toBeInTheDocument();
  });

  it("does not render filter pills when no filters are applied", () => {
    render(
      <MarketplaceToolbar
        state={{
          filter: "buy",
          sort: "price-asc"
        }}
        totalOffers={50}
      />
    );
    expect(screen.getByText(/50 entries/i)).toBeInTheDocument();
    expect(screen.queryByText(/token #/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/min .* eth/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/max .* eth/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/highest price first|most recent first/i)).not.toBeInTheDocument();
  });
});
