import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ContractsProvider } from "@/components/providers/contracts-context";

const NFT_ADDRESS = "0x895a6F444BE4ba9d124F61DF736605792B35D66b";
const { prepareContractWrite, walletStatus, writeContractAsync } = vi.hoisted(
  () => ({
    prepareContractWrite: vi.fn(),
    writeContractAsync: vi.fn(),
    walletStatus: {
      address: "0x1234567890abcdef1234567890abcdef12345678",
      canTransact: false,
      isReady: false
    }
  })
);

vi.mock("wagmi", () => ({
  usePublicClient: () => ({ simulateContract: vi.fn() }),
  useReadContract: ({ functionName }: { functionName: string }) => {
    if (functionName === "timeUntilWithdrawal") {
      return { data: 0n };
    }
    if (functionName === "lastMinter") {
      return {
        data: walletStatus.address,
        isError: false,
        isLoading: false
      };
    }
    return { data: 1_000_000_000_000_000_000n };
  },
  useWaitForTransactionReceipt: () => ({
    isLoading: false,
    isSuccess: false
  }),
  useWriteContract: () => ({
    data: undefined,
    isPending: false,
    writeContractAsync
  })
}));

vi.mock("@rainbow-me/rainbowkit", () => ({
  useChainModal: () => ({ openChainModal: vi.fn() }),
  useConnectModal: () => ({ openConnectModal: vi.fn() })
}));

vi.mock("@/lib/web3/transaction-preflight", () => ({
  prepareContractWrite
}));

vi.mock("@/lib/web3/use-wallet-status", () => ({
  useWalletStatus: () => walletStatus
}));

import { RedeemExperience } from "@/components/feature/redeem-experience";

function renderRedeem() {
  return render(
    <ContractsProvider value={{ NFT_ADDRESS }}>
      <RedeemExperience />
    </ContractsProvider>
  );
}

describe("RedeemExperience wallet gating", () => {
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

  it("keeps withdrawal disabled until the wallet is transaction-ready", () => {
    renderRedeem();

    expect(screen.getByRole("button", { name: /withdraw now/i })).toBeDisabled();
  });

  it("preflights and submits after the wallet becomes ready", async () => {
    walletStatus.canTransact = true;
    walletStatus.isReady = true;
    renderRedeem();

    await userEvent.click(screen.getByRole("button", { name: /withdraw now/i }));

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
