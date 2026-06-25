import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AXIOM_ZERO_MARKETPLACE_URL } from "@/lib/config";

vi.mock("next/navigation", () => ({
  usePathname: () => "/"
}));

vi.mock("@/lib/use-mounted", () => ({
  useMounted: () => true
}));

vi.mock("@/components/layout/connect-wallet-button", () => ({
  ConnectWalletButton: () => <button type="button">Connect Wallet</button>
}));

import { SiteHeader } from "@/components/layout/site-header";

describe("SiteHeader", () => {
  it("renders the marketplace nav item as an external Axiom Zero link", () => {
    render(<SiteHeader />);

    const marketplaceLinks = screen.getAllByRole("link", { name: "Marketplace" });

    expect(marketplaceLinks[0]).toHaveAttribute("href", AXIOM_ZERO_MARKETPLACE_URL);
    expect(marketplaceLinks[0]).toHaveAttribute("target", "_blank");
    expect(marketplaceLinks[0]).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("does not render the retired My Offers shortcut", () => {
    render(<SiteHeader />);

    expect(screen.queryByRole("link", { name: /my offers/i })).not.toBeInTheDocument();
  });
});
