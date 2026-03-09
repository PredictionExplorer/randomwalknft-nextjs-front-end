import { describe, expect, it } from "vitest";

import { getErrorMessage } from "@/lib/web3/errors";

describe("getErrorMessage", () => {
  it("returns message from standard Error", () => {
    expect(getErrorMessage(new Error("Connection failed"))).toBe("Connection failed");
  });

  it("returns shortMessage from Viem-style errors (object with shortMessage property)", () => {
    expect(getErrorMessage({ shortMessage: "User rejected the request" })).toBe(
      "User rejected the request",
    );
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
