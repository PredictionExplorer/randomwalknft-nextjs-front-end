import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { toast } = vi.hoisted(() => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("sonner", () => ({ toast }));

import { CopyButton } from "@/components/common/copy-button";

describe("CopyButton", () => {
  beforeEach(() => {
    toast.success.mockReset();
    toast.error.mockReset();
  });

  it("copies the value, announces it, and shows a transient check mark", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    vi.useFakeTimers({ shouldAdvanceTime: true });

    render(<CopyButton value="0xseed" label="Copy" toastMessage="Seed copied." />);
    await userEvent.click(screen.getByRole("button", { name: /copy/i }));

    expect(writeText).toHaveBeenCalledWith("0xseed");
    expect(toast.success).toHaveBeenCalledWith("Seed copied.");
    expect(screen.getByRole("button")).toHaveTextContent(/copied/i);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2_000);
    });
    expect(screen.getByRole("button")).not.toHaveTextContent(/copied/i);
    vi.useRealTimers();
  });

  it("reports when the clipboard is unavailable", async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) } });
    render(<CopyButton value="x" label="Copy" />);
    await userEvent.click(screen.getByRole("button"));
    expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/copy failed/i));
  });
});
