import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ContractsProvider } from "@/components/providers/contracts-context";

const {
  NFT_ADDRESS,
  OWNER,
  OTHER,
  walletStatus,
  ownerOf,
  writeContractAsync,
  prepareContractWrite,
  publicClient,
  refresh,
  toast
} = vi.hoisted(() => ({
  NFT_ADDRESS: "0x895a6F444BE4ba9d124F61DF736605792B35D66b" as const,
  OWNER: "0x1234567890abcdef1234567890abcdef12345678",
  OTHER: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
  walletStatus: {
    address: "0x1234567890abcdef1234567890abcdef12345678",
    canTransact: true,
    isConnected: true,
    isWrongNetwork: false
  },
  ownerOf: { data: undefined as string | undefined },
  writeContractAsync: vi.fn(),
  prepareContractWrite: vi.fn(),
  publicClient: { waitForTransactionReceipt: vi.fn() },
  refresh: vi.fn(),
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() }
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh }) }));
vi.mock("sonner", () => ({ toast }));
vi.mock("wagmi", () => ({
  usePublicClient: () => publicClient,
  useReadContract: () => ownerOf,
  useWriteContract: () => ({ mutateAsync: writeContractAsync })
}));
vi.mock("@/lib/web3/use-wallet-status", () => ({ useWalletStatus: () => walletStatus }));
vi.mock("@/lib/web3/transaction-preflight", () => ({ prepareContractWrite }));
vi.mock("@/components/wallet/wallet-status-card", () => ({
  WalletStatusCard: () => <div data-testid="wallet-status-card" />
}));

import { CollectorTools } from "@/components/detail/collector-tools";

function renderTools(owner = OWNER, name = "") {
  return render(
    <ContractsProvider value={{ NFT_ADDRESS }}>
      <CollectorTools tokenId={42} owner={owner} name={name} />
    </ContractsProvider>
  );
}

describe("CollectorTools", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(walletStatus, { address: OWNER, canTransact: true, isConnected: true, isWrongNetwork: false });
    ownerOf.data = undefined;
    prepareContractWrite.mockResolvedValue({ gas: 50_000n });
    writeContractAsync.mockResolvedValue(`0x${"cd".repeat(32)}`);
    publicClient.waitForTransactionReceipt.mockResolvedValue({ status: "success" });
  });

  it("shows collecting options to visitors who do not own the work", () => {
    renderTools(OTHER);
    expect(screen.getByRole("link", { name: /open on axiom zero/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /mint your own/i })).toHaveAttribute("href", "/mint");
    expect(screen.queryByLabelText(/^name$/i)).not.toBeInTheDocument();
  });

  it("trusts the live chain owner over the indexer's owner", () => {
    ownerOf.data = OTHER;
    renderTools(OWNER);
    expect(screen.queryByLabelText(/^name$/i)).not.toBeInTheDocument();
  });

  it("lets the owner rename the work after simulating the write", async () => {
    renderTools(OWNER, "Old name");
    const input = screen.getByLabelText(/^name$/i);
    const save = screen.getByRole("button", { name: /save/i });
    expect(save).toBeDisabled();

    await userEvent.clear(input);
    await userEvent.type(input, "Drift");
    await userEvent.click(save);

    await waitFor(() => expect(writeContractAsync).toHaveBeenCalled());
    expect(prepareContractWrite).toHaveBeenCalledWith(
      expect.objectContaining({ functionName: "setTokenName", args: [42n, "Drift"], account: OWNER })
    );
    expect(writeContractAsync).toHaveBeenCalledWith(
      expect.objectContaining({ functionName: "setTokenName", gas: 50_000n })
    );
    await waitFor(() => expect(refresh).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith("Name updated on-chain.");
  });

  it("confirms before an irreversible transfer and rejects bad addresses", async () => {
    renderTools(OWNER);
    const input = screen.getByLabelText(/transfer to/i);

    await userEvent.type(input, "not-an-address");
    await userEvent.click(screen.getByRole("button", { name: /^send$/i }));
    expect(toast.error).toHaveBeenCalledWith("Enter a valid wallet address.");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await userEvent.clear(input);
    await userEvent.type(input, OTHER);
    await userEvent.click(screen.getByRole("button", { name: /^send$/i }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent(/cannot be undone/i);

    await userEvent.click(screen.getByRole("button", { name: /^transfer$/i }));
    await waitFor(() => expect(writeContractAsync).toHaveBeenCalled());
    expect(prepareContractWrite).toHaveBeenCalledWith(
      expect.objectContaining({ functionName: "transferFrom", args: [OWNER, OTHER, 42n] })
    );
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("#000042 transferred."));
  });

  it("shows the wallet card when the owner is on the wrong network", () => {
    Object.assign(walletStatus, { canTransact: false, isWrongNetwork: true });
    renderTools(OWNER);
    expect(screen.getByTestId("wallet-status-card")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
  });
});
