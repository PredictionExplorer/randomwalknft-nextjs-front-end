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

export async function assertSufficientBalanceForTransaction({
  publicClient,
  account,
  gas,
  value = 0n
}: {
  publicClient: PublicClient;
  account: Address;
  gas: bigint;
  value?: bigint;
}) {
  const [balance, feeEstimate] = await Promise.all([
    publicClient.getBalance({ address: account }),
    publicClient.estimateFeesPerGas()
  ]);

  const feePerGas = feeEstimate.maxFeePerGas ?? feeEstimate.gasPrice;

  if (!feePerGas) {
    return;
  }

  const estimatedTotal = value + gas * feePerGas;

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
    value
  });

  return { gas };
}
