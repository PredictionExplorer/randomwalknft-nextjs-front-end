import type {
  Abi,
  Address,
  ContractFunctionArgs,
  ContractFunctionName,
  EstimateContractGasParameters,
  PublicClient
} from "viem";
import { formatEther } from "viem";

const BASIS_POINTS = 10_000n;
const DEFAULT_GAS_BUFFER_BPS = 12_000n;
/** Multiplier on RPC fee estimates so tiny Arbitrum base-fee moves do not reject txs (e.g. maxFee < baseFee). */
const FEE_BUFFER_BPS = 20_000n;

type PrepareContractWriteParams<
  TAbi extends Abi,
  TFunctionName extends ContractFunctionName<TAbi, "nonpayable" | "payable">
> = {
  publicClient: PublicClient;
  account: Address;
  address: Address;
  abi: TAbi;
  functionName: TFunctionName;
  args?: ContractFunctionArgs<TAbi, "nonpayable" | "payable", TFunctionName>;
  value?: bigint;
};

export function applyBasisPointsBuffer(value: bigint, basisPoints: bigint) {
  return (value * basisPoints + BASIS_POINTS - 1n) / BASIS_POINTS;
}

export function applyGasBuffer(gasEstimate: bigint, gasBufferBps = DEFAULT_GAS_BUFFER_BPS) {
  return applyBasisPointsBuffer(gasEstimate, gasBufferBps);
}

export type BufferedWriteFees =
  | { gasPrice: bigint; maxFeePerGas?: never; maxPriorityFeePerGas?: never }
  | { maxFeePerGas: bigint; maxPriorityFeePerGas: bigint; gasPrice?: never };

/**
 * Fee fields to pass through to viem `writeContract` / wagmi `writeContractAsync`.
 * Buffers estimates so L2s with microscopic base fees do not fail with
 * "max fee per gas less than block base fee" between simulation and broadcast.
 */
export async function estimateBufferedTransactionFees(publicClient: PublicClient): Promise<BufferedWriteFees> {
  const [block, fees] = await Promise.all([
    publicClient.getBlock({ blockTag: "latest" }),
    publicClient.estimateFeesPerGas()
  ]);

  if (fees.gasPrice !== undefined && fees.maxFeePerGas === undefined) {
    return { gasPrice: applyBasisPointsBuffer(fees.gasPrice, FEE_BUFFER_BPS) };
  }

  const baseFee = block.baseFeePerGas ?? 0n;
  let maxFeePerGas = fees.maxFeePerGas ?? (baseFee > 0n ? baseFee * 2n : 1n);
  let maxPriorityFeePerGas = fees.maxPriorityFeePerGas ?? 0n;

  maxFeePerGas = applyBasisPointsBuffer(maxFeePerGas, FEE_BUFFER_BPS);
  maxPriorityFeePerGas = applyBasisPointsBuffer(maxPriorityFeePerGas, FEE_BUFFER_BPS);

  const minRequired = baseFee + maxPriorityFeePerGas;
  if (maxFeePerGas < minRequired) {
    maxFeePerGas = minRequired + (baseFee > 0n ? baseFee / 4n : 0n) + 50_000n;
  }

  return { maxFeePerGas, maxPriorityFeePerGas };
}

export async function assertSufficientBalanceForTransaction({
  publicClient,
  account,
  gas,
  value = 0n,
  feePerGas: feePerGasOverride
}: {
  publicClient: PublicClient;
  account: Address;
  gas: bigint;
  value?: bigint;
  /** When set (e.g. buffered EIP-1559 maxFee), use this instead of a fresh `estimateFeesPerGas`. */
  feePerGas?: bigint;
}) {
  const balance = await publicClient.getBalance({ address: account });

  let resolvedFee: bigint | undefined = feePerGasOverride;
  if (resolvedFee === undefined) {
    const feeEstimate = await publicClient.estimateFeesPerGas();
    resolvedFee = feeEstimate.maxFeePerGas ?? feeEstimate.gasPrice;
  }

  if (resolvedFee === undefined) {
    return;
  }

  const estimatedTotal = value + gas * resolvedFee;

  if (balance >= estimatedTotal) {
    return;
  }

  const missing = estimatedTotal - balance;
  throw new Error(
    `Insufficient funds to cover this transaction plus gas. Add about ${formatEther(missing)} ETH or lower the amount.`
  );
}

export async function prepareContractWrite<
  TAbi extends Abi,
  TFunctionName extends ContractFunctionName<TAbi, "nonpayable" | "payable">
>({ publicClient, account, value = 0n, ...request }: PrepareContractWriteParams<TAbi, TFunctionName>) {
  const feeFields = await estimateBufferedTransactionFees(publicClient);
  const feePerGasForBalance =
    "gasPrice" in feeFields ? feeFields.gasPrice : feeFields.maxFeePerGas;

  const gasEstimate = await publicClient.estimateContractGas({
    ...request,
    account,
    value
  } as EstimateContractGasParameters<
    TAbi,
    TFunctionName,
    ContractFunctionArgs<TAbi, "nonpayable" | "payable", TFunctionName>
  >);
  const gas = applyGasBuffer(gasEstimate);

  await assertSufficientBalanceForTransaction({
    publicClient,
    account,
    gas,
    value,
    feePerGas: feePerGasForBalance
  });

  return { gas, ...feeFields };
}
