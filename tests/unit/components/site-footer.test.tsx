import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteFooter } from "@/components/layout/site-footer";
import { AXIOM_ZERO_MARKETPLACE_URL } from "@/lib/config";

describe("SiteFooter", () => {
  it("renders the site name", () => {
    render(<SiteFooter />);

    expect(screen.getByText("Random Walk NFT")).toBeInTheDocument();
  });

  it("renders internal navigation links with correct hrefs", () => {
    render(<SiteFooter />);

    const marketplaceLink = screen.getByRole("link", { name: "Marketplace" });

    expect(screen.getByRole("link", { name: "Collection" })).toHaveAttribute("href", "/gallery");
    expect(marketplaceLink).toHaveAttribute("href", AXIOM_ZERO_MARKETPLACE_URL);
    expect(marketplaceLink).toHaveAttribute("target", "_blank");
    expect(marketplaceLink).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByRole("link", { name: "Mint" })).toHaveAttribute("href", "/mint");
    expect(screen.getByRole("link", { name: "FAQ" })).toHaveAttribute("href", "/faq");
  });

  it("does not advertise a built-in zero-fee marketplace", () => {
    render(<SiteFooter />);

    expect(screen.queryByText(/zero-fee marketplace/i)).not.toBeInTheDocument();
  });

  it("renders social links with target=_blank and rel attributes", () => {
    render(<SiteFooter />);

    const twitterLink = screen.getByRole("link", { name: "Twitter" });
    const discordLink = screen.getByRole("link", { name: "Discord" });

    expect(twitterLink).toHaveAttribute("target", "_blank");
    expect(twitterLink).toHaveAttribute("rel", "noopener noreferrer");
    expect(twitterLink).toHaveAttribute("href", "https://twitter.com/RandomWalkNFT");

    expect(discordLink).toHaveAttribute("target", "_blank");
    expect(discordLink).toHaveAttribute("rel", "noopener noreferrer");
    expect(discordLink).toHaveAttribute("href", "https://discord.gg/bGnPn96Qwt");
  });
});
