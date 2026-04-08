import { describe, expect, it, vi } from "vitest";
import type { PublicClient } from "viem";

import { marketAbi } from "@/generated/wagmi";
import {
  applyBasisPointsBuffer,
  applyGasBuffer,
  assertSufficientBalanceForTransaction,
  prepareContractWrite
} from "@/lib/web3/transaction-preflight";

const NFT_ADDRESS = "0x895a6F444BE4ba9d124F61DF736605792B35D66b" as const;
const MARKET_ADDRESS = "0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08" as const;

function createPublicClientMock(overrides?: Partial<PublicClient>) {
  return {
    estimateContractGas: vi.fn().mockResolvedValue(100n),
    estimateFeesPerGas: vi.fn().mockResolvedValue({ gasPrice: 2n }),
    getBlock: vi.fn().mockResolvedValue({ baseFeePerGas: null }),
    getBalance: vi.fn().mockResolvedValue(1_000n),
    ...overrides
  } as unknown as PublicClient;
}

describe("transaction preflight", () => {
  it("adds a 20% gas buffer", () => {
    expect(applyGasBuffer(100n)).toBe(120n);
  });

  it("applies arbitrary basis-point buffers without rounding down", () => {
    expect(applyBasisPointsBuffer(100n, 10_025n)).toBe(101n);
  });

  it("rounds buffered gas up", () => {
    expect(applyGasBuffer(101n)).toBe(122n);
  });

  it("allows transactions when balance covers value and gas", async () => {
    const publicClient = createPublicClientMock();

    await expect(
      assertSufficientBalanceForTransaction({
        publicClient,
        account: "0x0000000000000000000000000000000000000001",
        gas: 100n,
        value: 200n
      })
    ).resolves.toBeUndefined();
  });

  it("throws a friendly error when balance is too low", async () => {
    const publicClient = createPublicClientMock({
      getBalance: vi.fn().mockResolvedValue(100n)
    });

    await expect(
      assertSufficientBalanceForTransaction({
        publicClient,
        account: "0x0000000000000000000000000000000000000001",
        gas: 100n,
        value: 200n
      })
    ).rejects.toThrow("Insufficient funds to cover this transaction plus gas.");
  });

  it("prepares writes with buffered gas", async () => {
    const estimateContractGas = vi.fn().mockResolvedValue(100n);
    const publicClient = createPublicClientMock({
      estimateContractGas
    });

    await expect(
      prepareContractWrite({
        publicClient,
        account: "0x0000000000000000000000000000000000000001",
        address: MARKET_ADDRESS,
        abi: marketAbi,
        functionName: "makeBuyOffer",
        args: [NFT_ADDRESS, 42n],
        value: 200n
      })
    ).resolves.toEqual({ gas: 120n, gasPrice: 4n });

    expect(estimateContractGas).toHaveBeenCalledWith({
      address: MARKET_ADDRESS,
      abi: marketAbi,
      functionName: "makeBuyOffer",
      args: [NFT_ADDRESS, 42n],
      account: "0x0000000000000000000000000000000000000001",
      value: 200n
    });
  });

  it("prepares EIP-1559 writes with buffered max fees above base fee", async () => {
    const estimateContractGas = vi.fn().mockResolvedValue(50n);
    const publicClient = createPublicClientMock({
      estimateContractGas,
      estimateFeesPerGas: vi
        .fn()
        .mockResolvedValue({ maxFeePerGas: 20_002_000n, maxPriorityFeePerGas: 100n }),
      getBlock: vi.fn().mockResolvedValue({ baseFeePerGas: 20_004_000n }),
      getBalance: vi.fn().mockResolvedValue(10n ** 24n)
    });

    const result = await prepareContractWrite({
      publicClient,
      account: "0x0000000000000000000000000000000000000001",
      address: MARKET_ADDRESS,
      abi: marketAbi,
      functionName: "makeBuyOffer",
      args: [NFT_ADDRESS, 1n],
      value: 0n
    });

    expect(result.gas).toBe(60n);
    expect(result.maxFeePerGas).toBeGreaterThanOrEqual(20_004_000n + result.maxPriorityFeePerGas);
    expect(result.maxFeePerGas).toBeGreaterThan(20_002_000n);
  });
});
