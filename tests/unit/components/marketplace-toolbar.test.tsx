import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams("filter=sell&sort=recent&min=0.2")
}));

import { MarketplaceToolbar } from "@/components/marketplace/marketplace-toolbar";

describe("MarketplaceToolbar", () => {
  it("renders entry count, reset link, and filter buttons", () => {
    render(
      <MarketplaceToolbar
        state={{ filter: "buy", sort: "recent", min: 0.2, max: 2, query: 7 }}
        totalOffers={12}
      />
    );

    expect(screen.getByText(/12 entries/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /reset/i })).toHaveAttribute("href", "/marketplace");
    expect(screen.getByRole("button", { name: /buy offers/i })).toHaveAttribute("value", "buy");
    expect(screen.getByRole("button", { name: /apply filters/i })).toHaveAttribute("value", "buy");
  });

  it("renders active filter pills for query, min, and max", () => {
    render(
      <MarketplaceToolbar
        state={{ filter: "sell", sort: "price-asc", min: 0.5, max: 5, query: 42 }}
        totalOffers={100}
      />
    );

    expect(screen.getByText(/token #000042/i)).toBeInTheDocument();
    expect(screen.getByText(/min 0.5 eth/i)).toBeInTheDocument();
    expect(screen.getByText(/max 5 eth/i)).toBeInTheDocument();
  });

  it("does not render filter pills when no filters are applied", () => {
    render(
      <MarketplaceToolbar
        state={{ filter: "buy", sort: "price-asc" }}
        totalOffers={50}
      />
    );

    expect(screen.getByText(/50 entries/i)).toBeInTheDocument();
    expect(screen.queryByText(/token #/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/min .* eth/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/max .* eth/i)).not.toBeInTheDocument();
  });

  it("renders the sort dropdown outside the filter form", () => {
    const { container } = render(
      <MarketplaceToolbar
        state={{ filter: "sell", sort: "recent" }}
        totalOffers={10}
      />
    );

    const form = container.querySelector("form");
    const sortSelect = container.querySelector("select#marketplace-sort") as HTMLSelectElement;

    expect(sortSelect).toBeInTheDocument();
    expect(sortSelect.value).toBe("recent");
    expect(form?.contains(sortSelect)).toBe(false);
  });

  it("preserves current sort in hidden input inside the filter form", () => {
    const { container } = render(
      <MarketplaceToolbar
        state={{ filter: "sell", sort: "price-desc" }}
        totalOffers={10}
      />
    );

    const form = container.querySelector("form");
    const hiddenSort = form?.querySelector("input[name='sort']") as HTMLInputElement;
    expect(hiddenSort).toBeInTheDocument();
    expect(hiddenSort.value).toBe("price-desc");
  });

  it("navigates immediately when sort dropdown changes", () => {
    render(
      <MarketplaceToolbar
        state={{ filter: "sell", sort: "price-asc" }}
        totalOffers={10}
      />
    );

    const sortSelect = document.getElementById("marketplace-sort") as HTMLSelectElement;
    fireEvent.change(sortSelect, { target: { value: "recent" } });

    expect(push).toHaveBeenCalledWith(
      expect.stringContaining("sort=recent")
    );
  });
});
