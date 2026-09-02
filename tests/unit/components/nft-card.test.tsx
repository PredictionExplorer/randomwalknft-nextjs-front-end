import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NftCard } from "@/components/nft/nft-card";
import { WingProvider } from "@/components/providers/wing-provider";
import type { Wing } from "@/lib/wing";

function renderCard(ui: React.ReactElement, wing: Wing = "dark") {
  return render(<WingProvider initialWing={wing}>{ui}</WingProvider>);
}

describe("NftCard", () => {
  it("renders the black-edition preview and token label in the dark wing", () => {
    renderCard(<NftCard id={42} href="/detail/42" />);

    const image = screen.getByRole("img", { name: /Random Walk NFT #000042 .* black edition/ });
    expect(image).toHaveAttribute("src", expect.stringContaining("000042_black_thumb.jpg"));
    expect(screen.getByText("#000042")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/detail/42");
  });

  it("follows the light wing with the white edition", () => {
    renderCard(<NftCard id={42} />, "light");

    expect(screen.getByRole("img", { name: /white edition/ })).toHaveAttribute(
      "src",
      expect.stringContaining("000042_white_thumb.jpg")
    );
  });

  it("lets a caller pin an edition regardless of the wing", () => {
    renderCard(<NftCard id={42} edition="white" />, "dark");

    expect(screen.getByRole("img")).toHaveAttribute("src", expect.stringContaining("_white_thumb.jpg"));
  });

  it("shows a sublabel badge when provided", () => {
    renderCard(<NftCard id={7} sublabel="Beauty rank #1" />);

    expect(screen.getByText("Beauty rank #1")).toBeInTheDocument();
  });

  it("only loads the film once the visitor hovers or focuses the card", () => {
    const { container } = renderCard(<NftCard id={9} href="/detail/9" />);
    expect(container.querySelector("video")).not.toBeInTheDocument();

    fireEvent.focus(screen.getByRole("link"));
    expect(container.querySelector("video source")).toHaveAttribute(
      "src",
      expect.stringContaining("000009_black_single.mp4")
    );

    fireEvent.blur(screen.getByRole("link"));
    expect(container.querySelector("video")).not.toBeInTheDocument();
  });

  it("falls back to a placeholder when the preview fails to load", () => {
    renderCard(<NftCard id={3} />);

    fireEvent.error(screen.getByRole("img"));

    expect(screen.getByText("Preview not available yet")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
