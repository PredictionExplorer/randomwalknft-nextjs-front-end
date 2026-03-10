import { describe, expect, it, vi } from "vitest";
import type { PublicClient } from "viem";

import { marketAbi } from "@/generated/wagmi";
import { MARKET_ADDRESS, NFT_ADDRESS } from "@/lib/config";
import {
  applyBasisPointsBuffer,
  applyGasBuffer,
  assertSufficientBalanceForTransaction,
  prepareContractWrite
} from "@/lib/web3/transaction-preflight";

function createPublicClientMock(overrides?: Partial<PublicClient>) {
  return {
    estimateContractGas: vi.fn().mockResolvedValue(100n),
    estimateFeesPerGas: vi.fn().mockResolvedValue({ gasPrice: 2n }),
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
    ).resolves.toEqual({ gas: 120n });

    expect(estimateContractGas).toHaveBeenCalledWith({
      address: MARKET_ADDRESS,
      abi: marketAbi,
      functionName: "makeBuyOffer",
      args: [NFT_ADDRESS, 42n],
      account: "0x0000000000000000000000000000000000000001",
      value: 200n
    });
  });
});
