import { decodeFunctionData, encodeAbiParameters, encodeFunctionResult, numberToHex, type Hex } from "viem";

import { nftAbi } from "../../../src/generated/wagmi.ts";
import { CHAIN_ID, MULTICALL3_ADDRESS, NFT_ADDRESS, ownerOf, seedFor, state } from "./world.ts";

type JsonRpcRequest = { id: number | string | null; method: string; params?: unknown[] };
type JsonRpcResponse = {
  jsonrpc: "2.0";
  id: number | string | null;
  result?: unknown;
  error?: { code: number; message: string };
};

const MULTICALL3_ABI = [
  {
    type: "function",
    name: "getEthBalance",
    stateMutability: "view",
    inputs: [{ name: "addr", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }]
  },
  {
    type: "function",
    name: "aggregate3",
    stateMutability: "payable",
    inputs: [
      {
        name: "calls",
        type: "tuple[]",
        components: [
          { name: "target", type: "address" },
          { name: "allowFailure", type: "bool" },
          { name: "callData", type: "bytes" }
        ]
      }
    ],
    outputs: [
      {
        name: "returnData",
        type: "tuple[]",
        components: [
          { name: "success", type: "bool" },
          { name: "returnData", type: "bytes" }
        ]
      }
    ]
  }
] as const;

let blockNumber = 250_000_000;

/** Answers one `eth_call` against the NFT contract with the world state. */
function callNft(data: Hex): Hex {
  const { functionName, args } = decodeFunctionData({ abi: nftAbi, data });
  const encode = (result: string | bigint | boolean | readonly bigint[] | readonly Hex[]) =>
    encodeFunctionResult({ abi: nftAbi, functionName, result });

  switch (functionName) {
    case "totalSupply":
      return encode(BigInt(state.totalSupply));
    case "withdrawalAmount":
      return encode(state.withdrawalAmountWei);
    case "getMintPrice":
      return encode(state.mintPriceWei);
    case "timeUntilWithdrawal":
      return encode(BigInt(state.secondsUntilWithdrawal));
    case "timeUntilSale":
      return encode(BigInt(state.timeUntilSale));
    case "numWithdrawals":
      return encode(BigInt(state.numWithdrawals));
    case "lastMinter":
      return encode(state.lastMinter);
    case "lastMintTime":
      return encode(BigInt(state.lastMintTime));
    case "walletOfOwner": {
      const [owner] = args as readonly [string];
      const ids = state.walletTokens[owner.toLowerCase()] ?? [];
      return encode(ids.map((id) => BigInt(id)));
    }
    case "ownerOf": {
      const [tokenId] = args;
      return encode(ownerOf(Number(tokenId)));
    }
    case "seeds": {
      const [tokenId] = args;
      return encode(seedFor(Number(tokenId)));
    }
    case "tokenNames": {
      const [tokenId] = args;
      return encode(state.names[Number(tokenId)] ?? "");
    }
    // Writes simulated via eth_call succeed with no return data.
    case "mint":
    case "withdraw":
    case "setTokenName":
    case "transferFrom":
      return "0x";
    default:
      throw new Error(`Unsupported NFT call: ${functionName}`);
  }
}

function ethCall(params: unknown[]): Hex {
  const call = params[0] as { to?: string; data?: Hex };
  const to = call.to?.toLowerCase();
  const data = call.data ?? "0x";
  if (to === NFT_ADDRESS.toLowerCase()) {
    return callNft(data);
  }
  if (to === MULTICALL3_ADDRESS.toLowerCase()) {
    return callMulticall(data);
  }
  return "0x";
}

/** Every account in the mock world holds 1 ETH. */
const ONE_ETH = numberToHex(10n ** 18n, { size: 32 });

function callMulticall(data: Hex): Hex {
  const decoded = decodeFunctionData({ abi: MULTICALL3_ABI, data });
  if (decoded.functionName === "getEthBalance") {
    return ONE_ETH;
  }
  const [calls] = decoded.args;
  const results = calls.map((entry): { success: boolean; returnData: Hex } => {
    try {
      const target = entry.target.toLowerCase();
      if (target === NFT_ADDRESS.toLowerCase()) return { success: true, returnData: callNft(entry.callData) };
      if (target === MULTICALL3_ADDRESS.toLowerCase())
        return { success: true, returnData: callMulticall(entry.callData) };
      throw new Error("unknown target");
    } catch {
      return { success: false, returnData: "0x" };
    }
  });
  return encodeAbiParameters(MULTICALL3_ABI[1].outputs, [results]);
}

function receiptFor(hash: string) {
  // A mint hash confirms a new token: bump supply once so the reveal reads the fresh id.
  const pendingIndex = state.pendingMintHashes.indexOf(hash);
  if (pendingIndex !== -1) {
    state.pendingMintHashes.splice(pendingIndex, 1);
    state.totalSupply += 1;
    state.pendingTokens.push(state.totalSupply - 1);
  }
  blockNumber += 1;
  return {
    transactionHash: hash,
    transactionIndex: "0x0",
    blockHash: `0x${"ab".repeat(32)}`,
    blockNumber: numberToHex(blockNumber),
    from: state.lastMinter,
    to: NFT_ADDRESS,
    cumulativeGasUsed: "0x5208",
    gasUsed: "0x5208",
    effectiveGasPrice: "0x5f5e100",
    contractAddress: null,
    logs: [],
    logsBloom: `0x${"00".repeat(256)}`,
    status: "0x1",
    type: "0x2"
  };
}

function handleOne(request: JsonRpcRequest): JsonRpcResponse {
  const { id, method, params = [] } = request;
  try {
    let result: unknown;
    switch (method) {
      case "eth_chainId":
        result = numberToHex(CHAIN_ID);
        break;
      case "net_version":
        result = String(CHAIN_ID);
        break;
      case "eth_blockNumber":
        result = numberToHex(blockNumber);
        break;
      case "eth_getBlockByNumber":
        result = {
          number: numberToHex(blockNumber),
          hash: `0x${"cd".repeat(32)}`,
          parentHash: `0x${"ce".repeat(32)}`,
          timestamp: numberToHex(Math.floor(Date.now() / 1000)),
          baseFeePerGas: "0x5f5e100",
          gasLimit: "0x4000000000000",
          gasUsed: "0x0",
          miner: `0x${"00".repeat(20)}`,
          transactions: [],
          difficulty: "0x1",
          extraData: "0x",
          nonce: "0x0000000000000000",
          size: "0x0",
          logsBloom: `0x${"00".repeat(256)}`,
          sha3Uncles: `0x${"00".repeat(32)}`,
          stateRoot: `0x${"00".repeat(32)}`,
          receiptsRoot: `0x${"00".repeat(32)}`,
          transactionsRoot: `0x${"00".repeat(32)}`,
          totalDifficulty: "0x1",
          uncles: []
        };
        break;
      case "eth_gasPrice":
        result = "0x5f5e100";
        break;
      case "eth_maxPriorityFeePerGas":
        result = "0x0";
        break;
      case "eth_estimateGas":
        result = "0x30d40";
        break;
      case "eth_getBalance":
        result = numberToHex(10n ** 18n);
        break;
      case "eth_getTransactionCount":
        result = "0x1";
        break;
      case "eth_call":
        result = ethCall(params);
        break;
      case "eth_getTransactionReceipt":
        result = receiptFor(String(params[0]));
        break;
      case "eth_getTransactionByHash":
        result = { hash: params[0], blockNumber: numberToHex(blockNumber), from: state.lastMinter, to: NFT_ADDRESS };
        break;
      default:
        return { jsonrpc: "2.0", id, error: { code: -32601, message: `Method not supported by mock: ${method}` } };
    }
    return { jsonrpc: "2.0", id, result };
  } catch (error) {
    return {
      jsonrpc: "2.0",
      id,
      error: { code: -32000, message: error instanceof Error ? error.message : String(error) }
    };
  }
}

export function handleJsonRpc(body: unknown): JsonRpcResponse | JsonRpcResponse[] {
  if (Array.isArray(body)) {
    return body.map((entry) => handleOne(entry as JsonRpcRequest));
  }
  return handleOne(body as JsonRpcRequest);
}
