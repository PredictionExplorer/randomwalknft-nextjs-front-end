import { describe, expect, it } from "vitest";

import { classifyWalletError, getErrorMessage } from "@/lib/web3/errors";

describe("getErrorMessage", () => {
  it("returns message from standard Error", () => {
    expect(getErrorMessage(new Error("Connection failed"))).toBe("Connection failed");
  });

  it("returns shortMessage from Viem-style errors", () => {
    expect(getErrorMessage({ shortMessage: "Execution reverted" })).toBe("Execution reverted");
  });

  it("returns default for null, undefined, number, string", () => {
    expect(getErrorMessage(null)).toBe("Something went wrong.");
    expect(getErrorMessage(undefined)).toBe("Something went wrong.");
    expect(getErrorMessage(42)).toBe("Something went wrong.");
    expect(getErrorMessage("some string")).toBe("Something went wrong.");
  });

  it("returns default for empty Error (no message)", () => {
    expect(getErrorMessage(new Error())).toBe("Something went wrong.");
  });

  it("returns default for object with empty shortMessage", () => {
    expect(getErrorMessage({ shortMessage: "" })).toBe("Something went wrong.");
  });
});

describe("classifyWalletError", () => {
  describe("user rejection", () => {
    it("classifies MetaMask 'User rejected the request.' as info", () => {
      const result = classifyWalletError({ shortMessage: "User rejected the request." });
      expect(result.severity).toBe("info");
      expect(result.message).toBe("Transaction cancelled. No changes were made.");
    });

    it("classifies 'user denied transaction' as info", () => {
      const result = classifyWalletError(new Error("user denied transaction signature"));
      expect(result.severity).toBe("info");
      expect(result.message).toBe("Transaction cancelled. No changes were made.");
    });

    it("classifies 'User cancelled' (British spelling) as info", () => {
      const result = classifyWalletError(new Error("User cancelled the operation"));
      expect(result.severity).toBe("info");
    });

    it("classifies 'request rejected' as info", () => {
      const result = classifyWalletError({ shortMessage: "Request rejected by wallet" });
      expect(result.severity).toBe("info");
    });

    it("classifies 'ACTION_REJECTED' (case insensitive) as info", () => {
      const result = classifyWalletError(new Error("ACTION_REJECTED"));
      expect(result.severity).toBe("info");
    });

    it("classifies 'user disapproved' as info", () => {
      const result = classifyWalletError(new Error("user disapproved requested methods"));
      expect(result.severity).toBe("info");
    });

    it("classifies 'transaction was rejected' as info", () => {
      const result = classifyWalletError({ shortMessage: "The transaction was rejected" });
      expect(result.severity).toBe("info");
    });
  });

  describe("insufficient funds", () => {
    it("classifies 'insufficient funds' as warning", () => {
      const result = classifyWalletError(new Error("insufficient funds for gas * price + value"));
      expect(result.severity).toBe("warning");
      expect(result.message).toBe("Insufficient funds to complete this transaction.");
    });

    it("classifies 'exceeds the balance' as warning", () => {
      const result = classifyWalletError({ shortMessage: "Transfer amount exceeds the balance" });
      expect(result.severity).toBe("warning");
    });

    it("classifies 'not enough balance' as warning", () => {
      const result = classifyWalletError(new Error("not enough balance in account"));
      expect(result.severity).toBe("warning");
    });
  });

  describe("network errors", () => {
    it("classifies 'network changed' as warning", () => {
      const result = classifyWalletError(new Error("Underlying network changed"));
      expect(result.severity).toBe("warning");
      expect(result.message).toBe("Network changed. Please switch back to Arbitrum and try again.");
    });

    it("classifies 'chain mismatch' as warning", () => {
      const result = classifyWalletError({ shortMessage: "Chain mismatch detected" });
      expect(result.severity).toBe("warning");
    });
  });

  describe("unknown errors", () => {
    it("passes through unknown error messages as error severity", () => {
      const result = classifyWalletError(new Error("execution reverted: ERC721: invalid token ID"));
      expect(result.severity).toBe("error");
      expect(result.message).toBe("execution reverted: ERC721: invalid token ID");
    });

    it("returns generic fallback for completely unknown errors", () => {
      const result = classifyWalletError(42);
      expect(result.severity).toBe("error");
      expect(result.message).toBe("Something went wrong.");
    });

    it("returns generic fallback for null", () => {
      const result = classifyWalletError(null);
      expect(result.severity).toBe("error");
      expect(result.message).toBe("Something went wrong.");
    });
  });

  describe("priority: shortMessage over message", () => {
    it("prefers shortMessage when both exist", () => {
      const error = {
        message: "Some long technical error message with stack trace",
        shortMessage: "User rejected the request."
      };
      const result = classifyWalletError(error);
      expect(result.severity).toBe("info");
    });
  });
});
