import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EnvMissingPage } from "@/components/env-missing-page";
import { AppProviders } from "@/components/providers/app-providers";
import { useContracts } from "@/components/providers/contracts-context";
import { useWing } from "@/components/providers/wing-provider";
import { useWalletUi } from "@/components/wallet/wallet-provider";

vi.mock("@/components/wallet/wallet-lifecycle-bridge", () => ({ WalletLifecycleBridge: () => null }));
vi.mock("next/navigation", () => ({
  permanentRedirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  })
}));

function Probe() {
  const { edition } = useWing();
  const { NFT_ADDRESS } = useContracts();
  const walletUi = useWalletUi();
  return (
    <output data-testid="probe">
      {edition}:{NFT_ADDRESS}:{typeof walletUi.openConnectModal}
    </output>
  );
}

describe("AppProviders", () => {
  it("wires wing, contracts, wagmi, queries, wallet UI, and marks hydration", () => {
    delete document.documentElement.dataset.hydrated;
    render(
      <AppProviders initialWing="light" contracts={{ NFT_ADDRESS: "0x895a6F444BE4ba9d124F61DF736605792B35D66b" }}>
        <Probe />
      </AppProviders>
    );
    expect(screen.getByTestId("probe")).toHaveTextContent("white:0x895a6F444BE4ba9d124F61DF736605792B35D66b:function");
    expect(document.documentElement.dataset.hydrated).toBe("true");
  });
});

describe("EnvMissingPage", () => {
  it("names every missing variable so the operator can fix the deploy", () => {
    render(<EnvMissingPage missingKeys={["NEXT_PUBLIC_NETWORK", "NEXT_PUBLIC_RPC_URL"]} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/environment variables unset/i);
    expect(screen.getByText("NEXT_PUBLIC_RPC_URL")).toBeInTheDocument();
  });
});

describe("MarketplacePage", () => {
  it("permanently redirects to Axiom Zero", async () => {
    const { default: MarketplacePage } = await import("@/app/(site)/marketplace/page");
    expect(() => MarketplacePage()).toThrow("REDIRECT:https://www.axiomzero.market/random-walk");
  });
});
