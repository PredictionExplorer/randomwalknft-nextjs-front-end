import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Countdown } from "@/components/common/countdown";

describe("Countdown", () => {
  it("renders duration segments", () => {
    render(<Countdown seconds={3661} />);

    expect(screen.getByText(/hours/i)).toBeInTheDocument();
    expect(screen.getByText(/minutes/i)).toBeInTheDocument();
    expect(screen.getByText(/seconds/i)).toBeInTheDocument();
  });

  it("calls onComplete when the timer reaches zero", () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();

    render(<Countdown seconds={1} onComplete={onComplete} />);
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(onComplete).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
