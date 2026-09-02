import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ContractsProvider } from "@/components/providers/contracts-context";
import type { VaultState } from "@/lib/types";

const NFT_ADDRESS = "0x895a6F444BE4ba9d124F61DF736605792B35D66b";
const { prepareContractWrite, walletStatus, writeContractAsync } = vi.hoisted(() => ({
  prepareContractWrite: vi.fn(),
  writeContractAsync: vi.fn(),
  walletStatus: {
    address: "0x1234567890abcdef1234567890abcdef12345678",
    canTransact: false,
    isReady: false
  }
}));

vi.mock("wagmi", () => ({
  usePublicClient: () => ({ simulateContract: vi.fn() }),
  useWaitForTransactionReceipt: () => ({
    isLoading: false,
    isSuccess: false
  }),
  useWriteContract: () => ({
    data: undefined,
    isPending: false,
    mutateAsync: writeContractAsync
  })
}));

vi.mock("@/components/wallet/wallet-provider", () => ({
  useWalletUi: () => ({ openChainModal: vi.fn(), openConnectModal: vi.fn() })
}));

vi.mock("@/lib/web3/transaction-preflight", () => ({
  prepareContractWrite
}));

vi.mock("@/lib/web3/use-wallet-status", () => ({
  useWalletStatus: () => walletStatus
}));

import { VaultExperience } from "@/components/feature/vault-experience";

function buildVault(overrides: Partial<VaultState> = {}): VaultState {
  return {
    prizeEth: 40.63,
    prizeWei: "40630000000000000000",
    secondsUntilWithdrawal: 0,
    lastMinter: walletStatus.address,
    mintPriceEth: 0.0904,
    mintedCount: 4096,
    numWithdrawals: 0,
    readAtMs: Date.now(),
    ...overrides
  };
}

function renderVault(vault: VaultState = buildVault()) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ContractsProvider value={{ NFT_ADDRESS }}>
        <VaultExperience initialVault={vault} />
      </ContractsProvider>
    </QueryClientProvider>
  );
}

describe("VaultExperience", () => {
  beforeEach(() => {
    Object.assign(walletStatus, {
      canTransact: false,
      isReady: false
    });
    prepareContractWrite.mockReset();
    prepareContractWrite.mockResolvedValue({ gas: 100_000n });
    writeContractAsync.mockReset();
    writeContractAsync.mockResolvedValue(`0x${"22".repeat(32)}`);
  });

  it("shows the live prize and keyholder", () => {
    renderVault();

    expect(screen.getByTestId("vault-prize")).toHaveTextContent("40.63");
    expect(screen.getByText(/half of everything the contract holds/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: walletStatus.address })).toHaveAttribute(
      "href",
      `/gallery?address=${walletStatus.address}`
    );
  });

  it("keeps withdrawal disabled until the wallet is transaction-ready", () => {
    renderVault();

    expect(screen.getByTestId("vault-withdraw")).toBeDisabled();
  });

  it("keeps withdrawal disabled while the clock is still running", () => {
    walletStatus.canTransact = true;
    walletStatus.isReady = true;
    renderVault(buildVault({ secondsUntilWithdrawal: 86_400 }));

    expect(screen.getByTestId("vault-withdraw")).toBeDisabled();
    expect(screen.getByText(/^opens in$/i)).toBeInTheDocument();
    expect(screen.getByText(/about 1 day and 0 hours remain/i)).toBeInTheDocument();
  });

  it("preflights and submits the withdrawal once claimable and ready", async () => {
    walletStatus.canTransact = true;
    walletStatus.isReady = true;
    renderVault();

    await userEvent.click(screen.getByTestId("vault-withdraw"));

    expect(prepareContractWrite).toHaveBeenCalledWith(
      expect.objectContaining({
        account: walletStatus.address,
        address: NFT_ADDRESS,
        functionName: "withdraw"
      })
    );
    expect(writeContractAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        address: NFT_ADDRESS,
        functionName: "withdraw",
        gas: 100_000n
      })
    );
  });
});
