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

function extractRawMessage(error: unknown): string {
  if (typeof error === "object" && error && "shortMessage" in error) {
    const shortMessage = (error as { shortMessage?: string }).shortMessage;
    if (shortMessage) return shortMessage;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "";
}

export function classifyWalletError(error: unknown): WalletError {
  const raw = extractRawMessage(error);

  if (raw && matchesAny(raw, USER_REJECTION_PATTERNS)) {
    return {
      message: "Transaction cancelled. No changes were made.",
      severity: "info"
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
      message: "Network changed. Please switch back to Arbitrum and try again.",
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
