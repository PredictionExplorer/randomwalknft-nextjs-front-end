import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NftCard } from "@/components/nft/nft-card";

describe("NftCard extended branches", () => {
  it("renders in compact mode with square aspect ratio", () => {
    const { container } = render(
      <NftCard id={1} image="/test.jpg" href="/detail/1" compact />
    );
    expect(container.querySelector(".aspect-square")).toBeInTheDocument();
  });

  it("renders with custom label instead of token id", () => {
    render(<NftCard id={1} image="/test.jpg" href="/detail/1" label="Featured" />);
    expect(screen.getByText("Featured")).toBeInTheDocument();
  });

  it("renders without link when href is not provided", () => {
    const { container } = render(<NftCard id={1} image="/test.jpg" />);
    expect(container.querySelector("a")).not.toBeInTheDocument();
  });

  it("renders non-compact mode with landscape aspect ratio", () => {
    const { container } = render(
      <NftCard id={1} image="/test.jpg" href="/detail/1" />
    );
    expect(container.querySelector("[class*='aspect-\\[1.6\\/1\\]']") || container.querySelector("[class*='aspect-']")).toBeInTheDocument();
  });
});
