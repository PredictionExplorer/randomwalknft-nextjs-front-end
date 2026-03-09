import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteFooter } from "@/components/layout/site-footer";

describe("SiteFooter", () => {
  it("renders the site name", () => {
    render(<SiteFooter />);

    expect(screen.getByText("Random Walk NFT")).toBeInTheDocument();
  });

  it("renders internal navigation links with correct hrefs", () => {
    render(<SiteFooter />);

    expect(screen.getByRole("link", { name: "Collection" })).toHaveAttribute("href", "/gallery");
    expect(screen.getByRole("link", { name: "Marketplace" })).toHaveAttribute("href", "/marketplace");
    expect(screen.getByRole("link", { name: "Mint" })).toHaveAttribute("href", "/mint");
    expect(screen.getByRole("link", { name: "FAQ" })).toHaveAttribute("href", "/faq");
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
