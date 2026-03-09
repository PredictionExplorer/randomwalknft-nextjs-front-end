import { describe, expect, it, vi } from "vitest";

vi.mock("sonner", () => ({
  toast: {
    info: vi.fn(),
    warning: vi.fn(),
    error: vi.fn()
  }
}));

import { toast } from "sonner";
import { showWalletError } from "@/lib/web3/wallet-toast";

describe("showWalletError", () => {
  it("shows info toast for user rejection", () => {
    showWalletError({ shortMessage: "User rejected the request." });
    expect(toast.info).toHaveBeenCalledWith("Transaction cancelled. No changes were made.");
  });

  it("shows warning toast for insufficient funds", () => {
    showWalletError(new Error("insufficient funds for gas"));
    expect(toast.warning).toHaveBeenCalledWith("Insufficient funds to complete this transaction.");
  });

  it("shows warning toast for network errors", () => {
    showWalletError(new Error("Underlying network changed"));
    expect(toast.warning).toHaveBeenCalledWith("Network changed. Please switch back to Arbitrum and try again.");
  });

  it("shows error toast for unknown errors", () => {
    showWalletError(new Error("execution reverted"));
    expect(toast.error).toHaveBeenCalledWith("execution reverted");
  });

  it("shows generic error toast for null", () => {
    showWalletError(null);
    expect(toast.error).toHaveBeenCalledWith("Something went wrong.");
  });
});
