import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NftCard } from "@/components/nft/nft-card";

describe("NftCard", () => {
  it("renders the asset preview and token label", () => {
    render(
      <NftCard
        id={42}
        image="https://assets.test.example.com/randomwalk/000042_black_thumb.jpg"
        href="/detail/42"
      />
    );

    expect(
      screen.getByAltText(
        "Random Walk NFT #000042 — generative random walk artwork from an on-chain seed"
      )
    ).toBeInTheDocument();
    expect(screen.getByText("#000042")).toBeInTheDocument();
  });

  it("shows a sublabel badge when provided", () => {
    render(
      <NftCard
        id={7}
        image="https://assets.test.example.com/randomwalk/000007_black_thumb.jpg"
        sublabel="Beauty rank #1"
      />
    );

    expect(screen.getByText("Beauty rank #1")).toBeInTheDocument();
  });
});
