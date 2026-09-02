import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ContractsProvider } from "@/components/providers/contracts-context";

const NFT_ADDRESS = "0x895a6F444BE4ba9d124F61DF736605792B35D66b";
const { push, readContract, walletStatus } = vi.hoisted(() => ({
  push: vi.fn(),
  readContract: vi.fn(),
  walletStatus: { address: undefined as string | undefined }
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn() }) }));
vi.mock("wagmi", () => ({ useReadContract: (args: unknown) => readContract(args) }));
vi.mock("@/lib/web3/use-wallet-status", () => ({ useWalletStatus: () => walletStatus }));

import { TokenNav } from "@/components/detail/token-nav";

function renderNav(tokenId: number, totalSupply = 100) {
  return render(
    <ContractsProvider value={{ NFT_ADDRESS }}>
      <TokenNav tokenId={tokenId} totalSupply={totalSupply} />
    </ContractsProvider>
  );
}

describe("TokenNav", () => {
  beforeEach(() => {
    push.mockReset();
    readContract.mockReset().mockReturnValue({ data: undefined });
    walletStatus.address = undefined;
  });

  it("links to the neighbouring works and disables the ends of the collection", () => {
    renderNav(0, 10);
    expect(screen.getByRole("link", { name: /no previous work/i })).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("link", { name: /next work, #000001/i })).toHaveAttribute("href", "/detail/1");
  });

  it("navigates with the arrow keys", () => {
    renderNav(5);
    fireEvent.keyDown(document.body, { key: "ArrowRight" });
    expect(push).toHaveBeenCalledWith("/detail/6");
    fireEvent.keyDown(document.body, { key: "ArrowLeft" });
    expect(push).toHaveBeenCalledWith("/detail/4");
  });

  it("ignores arrows while the visitor is typing, holding modifiers, or inside a dialog", () => {
    renderNav(5);
    const input = document.createElement("input");
    document.body.appendChild(input);
    fireEvent.keyDown(input, { key: "ArrowRight" });
    fireEvent.keyDown(document.body, { key: "ArrowRight", metaKey: true });
    const dialog = document.createElement("div");
    dialog.setAttribute("role", "dialog");
    const inner = document.createElement("span");
    dialog.appendChild(inner);
    document.body.appendChild(dialog);
    fireEvent.keyDown(inner, { key: "ArrowLeft" });
    expect(push).not.toHaveBeenCalled();
    input.remove();
    dialog.remove();
  });

  it("does not move past the newest work", () => {
    renderNav(99, 100);
    fireEvent.keyDown(document.body, { key: "ArrowRight" });
    expect(push).not.toHaveBeenCalled();
  });

  it("offers wallet navigation when the connected owner holds several works", () => {
    walletStatus.address = "0x1234567890abcdef1234567890abcdef12345678";
    readContract.mockReturnValue({ data: [3n, 12n, 40n] });
    renderNav(12);

    const walletNav = screen.getByTestId("wallet-nav");
    expect(walletNav).toHaveTextContent("2 / 3");
    expect(walletNav.querySelector('a[href="/detail/3"]')).toBeInTheDocument();
    expect(walletNav.querySelector('a[href="/detail/40"]')).toBeInTheDocument();
  });

  it("hides wallet navigation for works the visitor does not own", () => {
    walletStatus.address = "0x1234567890abcdef1234567890abcdef12345678";
    readContract.mockReturnValue({ data: [3n, 40n] });
    renderNav(12);
    expect(screen.queryByTestId("wallet-nav")).not.toBeInTheDocument();
  });
});
