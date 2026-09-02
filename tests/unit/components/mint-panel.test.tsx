import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ContractsProvider } from "@/components/providers/contracts-context";
import type { VaultState } from "@/lib/types";

const { NFT_ADDRESS, ADDRESS, reads, walletStatus, publicClient, sendTransaction, receipt, push, toast } = vi.hoisted(
  () => {
    const reads: Record<"getMintPrice" | "withdrawalAmount" | "timeUntilSale", bigint | undefined> = {
      getMintPrice: 90_500_000_000_000_000n,
      withdrawalAmount: 40_680_000_000_000_000_000n,
      timeUntilSale: 0n
    };
    return {
      NFT_ADDRESS: "0x895a6F444BE4ba9d124F61DF736605792B35D66b" as const,
      ADDRESS: "0x1234567890abcdef1234567890abcdef12345678",
      reads,
      walletStatus: {
        address: "0x1234567890abcdef1234567890abcdef12345678",
        canTransact: true,
        isConnected: true,
        isReady: true,
        isWalletClientFetching: false,
        chain: { id: 42161 },
        isWrongNetwork: false,
        refetchWalletClient: vi.fn(),
        walletClient: { sendTransaction: vi.fn() }
      },
      publicClient: {
        readContract: vi.fn(),
        simulateContract: vi.fn(),
        estimateFeesPerGas: vi.fn()
      },
      sendTransaction: vi.fn(),
      receipt: { isSuccess: false },
      push: vi.fn(),
      toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() }
    };
  }
);

vi.mock("next/navigation", () => ({ useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn() }) }));
vi.mock("sonner", () => ({ toast }));
vi.mock("wagmi", () => ({
  usePublicClient: () => publicClient,
  useReadContract: ({ functionName }: { functionName: keyof typeof reads }) => ({
    data: reads[functionName],
    isLoading: reads[functionName] === undefined
  }),
  useWaitForTransactionReceipt: () => receipt
}));
vi.mock("@/lib/web3/use-wallet-status", () => ({ useWalletStatus: () => walletStatus }));
vi.mock("@/lib/web3/transaction-preflight", () => ({
  applyBasisPointsBuffer: (value: bigint, bps: bigint) => (value * bps) / 10_000n,
  estimateBufferedTransactionFees: vi.fn().mockResolvedValue({ maxFeePerGas: 1n, maxPriorityFeePerGas: 1n })
}));
vi.mock("@/components/wallet/wallet-status-card", () => ({
  WalletStatusCard: () => <div data-testid="wallet-status-card" />
}));
vi.mock("@/components/feature/mint-reveal-theater", () => ({
  MintRevealTheater: ({ tokenId }: { tokenId: number }) => <div data-testid="reveal">{tokenId}</div>
}));

import { MintPanel } from "@/components/feature/mint-panel";

const vault: VaultState = {
  prizeEth: 40.68,
  prizeWei: "40680000000000000000",
  secondsUntilWithdrawal: 1000,
  mintPriceEth: 0.0905,
  mintedCount: 4097,
  numWithdrawals: 0,
  readAtMs: Date.now()
};

function renderPanel(initialVault: VaultState | null = vault) {
  return render(
    <ContractsProvider value={{ NFT_ADDRESS }}>
      <MintPanel initialVault={initialVault} />
    </ContractsProvider>
  );
}

describe("MintPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reads.getMintPrice = 90_500_000_000_000_000n;
    reads.withdrawalAmount = 40_680_000_000_000_000_000n;
    reads.timeUntilSale = 0n;
    Object.assign(walletStatus, {
      address: ADDRESS,
      canTransact: true,
      isConnected: true,
      isReady: true,
      isWrongNetwork: false,
      walletClient: { sendTransaction }
    });
    sendTransaction.mockResolvedValue(`0x${"ab".repeat(32)}`);
    publicClient.readContract.mockResolvedValue(90_500_000_000_000_000n);
    publicClient.simulateContract.mockResolvedValue({ request: {} });
    receipt.isSuccess = false;
  });

  it("shows the live price, what the key is worth, and the ratio", () => {
    renderPanel();
    expect(screen.getByTestId("mint-price")).toHaveTextContent("0.0905 ETH");
    expect(screen.getByText("40.68 ETH")).toBeInTheDocument();
    expect(screen.getByText(/450× the mint price/)).toBeInTheDocument();
    expect(screen.getByTestId("mint-button")).toHaveTextContent(/0.0905 ETH/);
  });

  it("falls back to the server-read vault before the wallet RPC answers", () => {
    reads.getMintPrice = undefined;
    reads.withdrawalAmount = undefined;
    renderPanel();
    expect(screen.getByTestId("mint-price")).toHaveTextContent("0.0905 ETH");
    expect(screen.getByText("40.68 ETH")).toBeInTheDocument();
    expect(screen.getByTestId("mint-button")).toBeDisabled();
  });

  it("asks for a wallet and keeps the button disabled when not ready", () => {
    Object.assign(walletStatus, { canTransact: false, isReady: false, isConnected: false, address: undefined });
    renderPanel();
    expect(screen.getByTestId("wallet-status-card")).toBeInTheDocument();
    expect(screen.getByTestId("mint-button")).toBeDisabled();
  });

  it("simulates on the app RPC and sends the mint with a price buffer", async () => {
    renderPanel();
    await userEvent.click(screen.getByTestId("mint-button"));

    await waitFor(() => expect(sendTransaction).toHaveBeenCalled());
    expect(publicClient.simulateContract).toHaveBeenCalledWith(
      expect.objectContaining({ functionName: "mint", account: ADDRESS, value: 90_726_250_000_000_000n })
    );
    expect(sendTransaction).toHaveBeenCalledWith(
      expect.objectContaining({ to: NFT_ADDRESS, value: 90_726_250_000_000_000n, maxFeePerGas: 1n })
    );
    expect(toast.info).toHaveBeenCalledWith("Mint transaction submitted.");
    expect(screen.getByTestId("mint-button")).toHaveTextContent(/confirming on arbitrum/i);
  });

  it("refuses to mint while the wallet is on the wrong network", async () => {
    Object.assign(walletStatus, { isWrongNetwork: true, isReady: false });
    renderPanel();
    await userEvent.click(screen.getByTestId("mint-button"));
    expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/switch your wallet/i));
    expect(sendTransaction).not.toHaveBeenCalled();
  });

  it("surfaces a rejected simulation without sending anything", async () => {
    publicClient.simulateContract.mockRejectedValue(new Error("execution reverted: sale closed"));
    renderPanel();
    await userEvent.click(screen.getByTestId("mint-button"));
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(sendTransaction).not.toHaveBeenCalled();
    expect(screen.getByTestId("mint-button")).not.toBeDisabled();
  });

  it("shows the sale countdown when the sale has not opened", () => {
    reads.timeUntilSale = 3600n;
    renderPanel();
    expect(screen.getByText(/the sale opens in/i)).toBeInTheDocument();
    expect(screen.getByTestId("mint-button")).toBeDisabled();
  });
});
