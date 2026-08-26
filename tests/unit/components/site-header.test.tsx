import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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

function renderHeader() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, enabled: false } }
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <SiteHeader />
    </QueryClientProvider>
  );
}

describe("SiteHeader", () => {
  it("renders the marketplace nav item as an external Axiom Zero link", () => {
    renderHeader();

    const marketplaceLinks = screen.getAllByRole("link", { name: "Marketplace" });

    expect(marketplaceLinks[0]).toHaveAttribute("href", AXIOM_ZERO_MARKETPLACE_URL);
    expect(marketplaceLinks[0]).toHaveAttribute("target", "_blank");
    expect(marketplaceLinks[0]).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders the Vault nav item", () => {
    renderHeader();

    const vaultLinks = screen.getAllByRole("link", { name: "Vault" });
    expect(vaultLinks[0]).toHaveAttribute("href", "/vault");
  });

  it("does not render the retired Redeem nav item", () => {
    renderHeader();

    expect(screen.queryByRole("link", { name: /redeem/i })).not.toBeInTheDocument();
  });
});
