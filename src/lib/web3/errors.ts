import { getChainDisplayName } from "@/lib/web3/evm-chain";

type WalletError = {
  message: string;
  severity: "info" | "warning" | "error";
};

const USER_REJECTION_PATTERNS = [
  "user rejected",
  "user denied",
  "user cancelled",
  "user canceled",
  "rejected the request",
  "denied transaction",
  "request rejected",
  "transaction was rejected",
  "action_rejected",
  "user disapproved"
];

const INSUFFICIENT_FUNDS_PATTERNS = [
  "insufficient funds",
  "exceeds the balance",
  "not enough balance",
  "insufficient balance",
  "plus gas"
];

const NETWORK_PATTERNS = [
  "network changed",
  "chain mismatch",
  "wrong network",
  "disconnected from chain"
];

function matchesAny(text: string, patterns: string[]) {
  const lower = text.toLowerCase();
  return patterns.some((pattern) => lower.includes(pattern));
}

function errorChain(error: unknown): unknown[] {
  const queue: Array<{ value: unknown; depth: number }> = [{ value: error, depth: 0 }];
  const values: unknown[] = [];
  const seen = new WeakSet<object>();

  while (queue.length > 0) {
    const entry = queue.shift();
    if (!entry) {
      break;
    }

    const { value, depth } = entry;
    values.push(value);
    if (!value || typeof value !== "object" || depth >= 5 || seen.has(value)) {
      continue;
    }

    seen.add(value);
    const record = value as Record<string, unknown>;
    for (const key of ["cause", "error", "data", "originalError"]) {
      if (record[key] !== undefined) {
        queue.push({ value: record[key], depth: depth + 1 });
      }
    }
  }

  return values;
}

function extractErrorCode(error: unknown): number | undefined {
  for (const value of errorChain(error)) {
    if (!value || typeof value !== "object" || !("code" in value)) {
      continue;
    }

    const rawCode = (value as { code?: unknown }).code;
    const code =
      typeof rawCode === "number"
        ? rawCode
        : typeof rawCode === "string" && rawCode.trim() !== ""
          ? Number(rawCode)
          : Number.NaN;
    if (Number.isFinite(code)) {
      return code;
    }
  }

  return undefined;
}

function extractRawMessage(error: unknown): string {
  for (const value of errorChain(error)) {
    if (!value || typeof value !== "object") {
      continue;
    }

    const shortMessage = (value as { shortMessage?: unknown }).shortMessage;
    if (typeof shortMessage === "string" && shortMessage) {
      return shortMessage;
    }
    const message = (value as { message?: unknown }).message;
    if (typeof message === "string" && message) {
      return message;
    }
  }

  return "";
}

export function classifyWalletError(error: unknown): WalletError {
  const raw = extractRawMessage(error);
  const code = extractErrorCode(error);

  if (code === 4001 || (raw && matchesAny(raw, USER_REJECTION_PATTERNS))) {
    return {
      message: "Transaction cancelled. No changes were made.",
      severity: "info"
    };
  }

  if (code === -32002) {
    return {
      message: "A wallet request is already pending. Open MetaMask and complete or reject it before trying again.",
      severity: "warning"
    };
  }

  if (code === 4900 || code === 4901) {
    return {
      message: "MetaMask is disconnected. Reopen the wallet, return to this page, and try again.",
      severity: "warning"
    };
  }

  if (code === 4902) {
    return {
      message: `${getChainDisplayName()} is not available in this wallet yet. Add the network and try again.`,
      severity: "warning"
    };
  }

  if (raw && matchesAny(raw, INSUFFICIENT_FUNDS_PATTERNS)) {
    return {
      message:
        raw.toLowerCase().includes("plus gas")
          ? raw
          : "Insufficient funds to cover the transaction value and gas.",
      severity: "warning"
    };
  }

  if (raw && matchesAny(raw, NETWORK_PATTERNS)) {
    return {
      message: `Network changed. Please switch back to ${getChainDisplayName()} and try again.`,
      severity: "warning"
    };
  }

  if (raw) {
    return { message: raw, severity: "error" };
  }

  return { message: "Something went wrong.", severity: "error" };
}

export function getErrorMessage(error: unknown) {
  return classifyWalletError(error).message;
}
