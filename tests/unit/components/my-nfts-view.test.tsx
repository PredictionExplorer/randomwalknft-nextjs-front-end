import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ContractsProvider } from "@/components/providers/contracts-context";

const { walletStatus, read } = vi.hoisted(() => ({
  walletStatus: { address: "0x1234567890abcdef1234567890abcdef12345678", isReady: true },
  read: { data: undefined as bigint[] | undefined, error: null as Error | null, isError: false }
}));
vi.mock("wagmi", () => ({ useReadContract: () => read }));
vi.mock("@/lib/web3/use-wallet-status", () => ({ useWalletStatus: () => walletStatus }));
vi.mock("@/lib/use-mounted", () => ({ useMounted: () => true }));
vi.mock("@/components/wallet/wallet-status-card", () => ({
  WalletStatusCard: ({ disconnectedBody }: { disconnectedBody: string }) => (
    <p data-testid="wallet-status-card">{disconnectedBody}</p>
  )
}));

import { MyNftsView } from "@/components/feature/my-nfts-view";

function renderView() {
  return render(
    <ContractsProvider value={{ NFT_ADDRESS: "0x895a6F444BE4ba9d124F61DF736605792B35D66b" }}>
      <MyNftsView />
    </ContractsProvider>
  );
}

describe("MyNftsView", () => {
  beforeEach(() => {
    Object.assign(walletStatus, { address: "0x1234567890abcdef1234567890abcdef12345678", isReady: true });
    Object.assign(read, { data: undefined, error: null, isError: false });
  });

  it("asks for a wallet when none is ready", () => {
    Object.assign(walletStatus, { address: undefined, isReady: false });
    renderView();
    expect(screen.getByTestId("wallet-status-card")).toHaveTextContent(/connect your wallet/i);
  });

  it("shows placeholders while the chain read is in flight", () => {
    const { container } = renderView();
    expect(container.querySelector("[aria-busy]")).toBeInTheDocument();
  });

  it("hangs the wallet's works newest first with a count and next steps", () => {
    read.data = [3n, 40n, 12n];
    renderView();
    const links = screen.getAllByRole("link", { name: /random walk nft #/i });
    expect(links.map((link) => link.getAttribute("href"))).toEqual(["/detail/40", "/detail/12", "/detail/3"]);
    expect(screen.getByText("3 works")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /public wall/i })).toHaveAttribute(
      "href",
      "/gallery?address=0x1234567890abcdef1234567890abcdef12345678"
    );
    expect(screen.getByRole("link", { name: /open cosmic signature/i })).toBeInTheDocument();
  });

  it("explains an empty wallet and a failed read", () => {
    read.data = [];
    const { rerender } = renderView();
    expect(screen.getByText(/no works in this wallet yet/i)).toBeInTheDocument();

    Object.assign(read, { data: undefined, isError: true, error: new Error("rpc down") });
    rerender(
      <ContractsProvider value={{ NFT_ADDRESS: "0x895a6F444BE4ba9d124F61DF736605792B35D66b" }}>
        <MyNftsView />
      </ContractsProvider>
    );
    expect(screen.getByRole("alert")).toHaveTextContent(/rpc down/);
  });
});
