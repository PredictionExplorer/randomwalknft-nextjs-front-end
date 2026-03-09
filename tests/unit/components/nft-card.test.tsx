import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NftCard } from "@/components/nft/nft-card";

describe("NftCard", () => {
  it("renders the asset preview and token label", () => {
    render(<NftCard id={42} image="/api/assets/000042_black_thumb.jpg" href="/detail/42" />);

    expect(screen.getByAltText("Preview image for NFT #000042")).toBeInTheDocument();
    expect(screen.getByText("#000042")).toBeInTheDocument();
  });
});
