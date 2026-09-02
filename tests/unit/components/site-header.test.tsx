import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { WingProvider } from "@/components/providers/wing-provider";
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
      <WingProvider initialWing="dark">
        <SiteHeader />
      </WingProvider>
    </QueryClientProvider>
  );
}

describe("SiteHeader", () => {
  it("renders the primary rooms as navigation links", () => {
    renderHeader();

    const nav = screen.getByRole("navigation", { name: /primary/i });
    expect(nav).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Collection" })[0]).toHaveAttribute("href", "/gallery");
    expect(screen.getAllByRole("link", { name: "Atelier" })[0]).toHaveAttribute("href", "/atelier");
    expect(screen.getAllByRole("link", { name: "Vault" })[0]).toHaveAttribute("href", "/vault");
    expect(screen.getAllByRole("link", { name: "Mint" })[0]).toHaveAttribute("href", "/mint");
  });

  it("offers the marketplace under Discover as an external Axiom Zero link", async () => {
    renderHeader();

    await userEvent.click(screen.getAllByRole("button", { name: /discover/i })[0]!);

    const marketplace = await screen.findByRole("menuitem", { name: /marketplace/i });
    expect(marketplace).toHaveAttribute("href", AXIOM_ZERO_MARKETPLACE_URL);
    expect(marketplace).toHaveAttribute("target", "_blank");
    expect(marketplace).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("exposes the wing toggle and the wallet button", () => {
    renderHeader();

    expect(screen.getAllByRole("switch", { name: /wing/i })[0]).toHaveAttribute("aria-checked", "false");
    expect(screen.getAllByRole("button", { name: /connect wallet/i })[0]).toBeInTheDocument();
  });

  it("does not render the retired Redeem nav item", () => {
    renderHeader();

    expect(screen.queryByRole("link", { name: /redeem/i })).not.toBeInTheDocument();
  });
});
