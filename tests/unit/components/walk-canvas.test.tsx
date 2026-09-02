import { act, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { WalkCanvas, type WalkCanvasHandle } from "@/components/feature/walk-canvas";
import type { GeneratedWalk } from "@/lib/walk/walk-engine";
import { installFakeCanvas } from "../../setup/fake-canvas";

const SEED = "0xa8dfd4a1e51e1d29fbbadd2c6e61d2b0c9c6d38ba26f291f04340722d5c2792d";

describe("WalkCanvas", () => {
  let fake: ReturnType<typeof installFakeCanvas>;

  beforeEach(() => {
    fake = installFakeCanvas();
    vi.useFakeTimers();
  });

  it("generates the walk, reports it, and animates to completion on its own clock", async () => {
    const onWalk = vi.fn();
    const onComplete = vi.fn();
    let now = 0;
    vi.spyOn(performance, "now").mockImplementation(() => now);
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });

    render(
      <WalkCanvas seed={SEED} vert={40} durationMs={1_000} onWalk={onWalk} onComplete={onComplete} label="Demo walk" />
    );
    expect(screen.getByRole("img", { name: "Demo walk" })).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(40);
    });
    expect(onWalk).toHaveBeenCalledTimes(1);
    const [walk, usedSeed] = onWalk.mock.calls[0] as [GeneratedWalk, string];
    expect(usedSeed).toBe(SEED);
    expect(walk.pointCount).toBeGreaterThan(100);

    // Drive the animation frames by hand until the drawing finishes.
    for (let step = 0; step < 20 && !onComplete.mock.calls.length; step += 1) {
      now += 100;
      const frame = frames.shift();
      if (!frame) break;
      act(() => frame(now));
    }
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(fake.contexts[0]!.calls.filter((call) => call === "putImageData").length).toBeGreaterThan(3);
    vi.useRealTimers();
  });

  it("in controlled mode paints only what the parent asks for", async () => {
    const handle = createRef<WalkCanvasHandle>();
    render(<WalkCanvas seed={SEED} vert={40} durationMs={0} handle={handle} />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(40);
    });
    const context = fake.contexts[0]!;
    const paintsBefore = context.calls.filter((call) => call === "putImageData").length;

    act(() => handle.current!.paintTo(0.5, 0.25));
    expect(context.calls.filter((call) => call === "putImageData").length).toBe(paintsBefore + 1);
    expect(context.calls).toContain("fillRect");
    const head = handle.current!.headPosition();
    expect(head.x).toBeGreaterThanOrEqual(0);
    expect(head.y).toBeGreaterThanOrEqual(0);
    vi.useRealTimers();
  });

  it("draws everything at once when the visitor prefers reduced motion", async () => {
    window.matchMedia = vi
      .fn()
      .mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
    const onComplete = vi.fn();
    render(<WalkCanvas seed={SEED} vert={40} durationMs={5_000} onComplete={onComplete} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(40);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
