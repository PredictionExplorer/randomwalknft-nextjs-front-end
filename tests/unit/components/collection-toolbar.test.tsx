import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CollectionToolbar } from "@/components/collection/collection-toolbar";
import { NftGrid } from "@/components/nft/nft-grid";
import { Pager } from "@/components/common/pager";
import type { CollectionQueryState } from "@/lib/types";

const WALLET = "0x1234567890abcdef1234567890abcdef12345678";

function state(overrides: Partial<CollectionQueryState> = {}): CollectionQueryState {
  return { sortBy: "tokenId", page: 1, view: "gallery", ...overrides };
}

describe("CollectionToolbar", () => {
  it("expresses rooms and hangings as links that keep the other filters", () => {
    render(<CollectionToolbar state={state({ view: "compact", page: 3 })} />);

    expect(screen.getByRole("link", { name: /most beautiful/i })).toHaveAttribute(
      "href",
      "/gallery?sortBy=beauty&view=compact"
    );
    expect(screen.getByRole("link", { name: /^newest$/i })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: /wall hanging/i })).toHaveAttribute("href", "/gallery?page=3");
    expect(screen.getByRole("link", { name: /study hanging/i })).toHaveAttribute("aria-pressed", "true");
  });

  it("carries the wallet and sort through the jump form and shows clearable chips", () => {
    render(<CollectionToolbar state={state({ address: WALLET, sortBy: "beauty", query: 7 })} />);

    const form = screen.getByRole("search");
    expect(form.querySelector('input[name="address"]')).toHaveValue(WALLET);
    expect(form.querySelector('input[name="sortBy"]')).toHaveValue("beauty");
    expect(screen.getByLabelText(/jump to token number/i)).toHaveValue(7);

    expect(screen.getByText(/collector 0x1234/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /clear collector filter/i })).toHaveAttribute(
      "href",
      "/gallery?query=7&sortBy=beauty"
    );
    expect(screen.getByRole("link", { name: /clear token filter/i })).toHaveAttribute(
      "href",
      `/gallery?address=${WALLET}&sortBy=beauty`
    );
  });
});

describe("NftGrid", () => {
  it("renders cards with beauty ranks from the offset, or an empty state", () => {
    const { rerender } = render(<NftGrid ids={[9, 4]} rankOffset={24} />);
    expect(screen.getByText("Beauty rank #25")).toBeInTheDocument();
    expect(screen.getByText("Beauty rank #26")).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(2);

    rerender(<NftGrid ids={[]} emptyMessage="Nothing here" emptyDescription="Try another room." />);
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
    expect(screen.getByText("Try another room.")).toBeInTheDocument();
  });

  it("uses the compact hanging when asked and can skip the reveal animation", () => {
    const { container } = render(<NftGrid ids={[1, 2, 3]} view="compact" disableAnimation />);
    expect(container.querySelectorAll(".aspect-square")).toHaveLength(3);
    expect(container.querySelector(".reveal")).not.toBeInTheDocument();
  });
});

describe("Pager", () => {
  it("renders nothing for a single page and windows long ranges with ellipses", () => {
    const { container, rerender } = render(<Pager pathname="/gallery" page={1} totalPages={1} />);
    expect(container).toBeEmptyDOMElement();

    rerender(
      <Pager pathname="/gallery" page={50} totalPages={171} searchParams={new URLSearchParams("sortBy=beauty")} />
    );
    expect(screen.getByRole("link", { name: /current page, page 50/i })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: /go to page 1$/i })).toHaveAttribute("href", "/gallery?sortBy=beauty");
    expect(screen.getByRole("link", { name: /go to page 171/i })).toHaveAttribute(
      "href",
      "/gallery?sortBy=beauty&page=171"
    );
    expect(screen.getAllByText("…")).toHaveLength(2);
  });
});
