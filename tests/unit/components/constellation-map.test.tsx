import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as MotionReact from "motion/react";

import { ConstellationMap } from "@/components/feature/constellation-map";
import { WingProvider } from "@/components/providers/wing-provider";
import { layoutConstellation } from "@/lib/walk/constellation";
import { installFakeCanvas } from "../../setup/fake-canvas";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn() }) }));
vi.mock("motion/react", async () => {
  const actual = await vi.importActual<typeof MotionReact>("motion/react");
  return { ...actual, useReducedMotion: () => true };
});

/** Pointer position (in a 400px square canvas) over the given normalised point. */
function pointerFor(point: { x: number; y: number }) {
  const size = 400;
  return { clientX: size / 2 + point.x * 0.47 * size, clientY: size / 2 + point.y * 0.47 * size };
}

describe("ConstellationMap", () => {
  let fake: ReturnType<typeof installFakeCanvas>;

  beforeEach(() => {
    fake = installFakeCanvas();
    push.mockReset();
    Object.defineProperty(HTMLCanvasElement.prototype, "clientWidth", { configurable: true, get: () => 400 });
    Object.defineProperty(HTMLCanvasElement.prototype, "getBoundingClientRect", {
      configurable: true,
      value: () => ({
        left: 0,
        top: 0,
        width: 400,
        height: 400,
        right: 400,
        bottom: 400,
        x: 0,
        y: 0,
        toJSON: () => ({})
      })
    });
  });

  function renderMap(count = 200) {
    return render(
      <WingProvider initialWing="dark">
        <ConstellationMap count={count} beautyOrder={[5, 9, 1, 2]} newestId={count - 1} featuredIds={[3]} />
      </WingProvider>
    );
  }

  it("draws every work as a point and rings the highlighted ones", () => {
    renderMap(200);
    const context = fake.contexts[0]!;
    // 200 dots + rings for the 4 beauty leaders, 1 featured, newest (2 rings).
    expect(context.calls.filter((call) => call === "arc").length).toBeGreaterThanOrEqual(207);
    expect(
      screen.getByRole("img", { name: /constellation of 200 random walk works arranged by mint order/i })
    ).toBeInTheDocument();
  });

  it("re-arranges by beauty when asked", async () => {
    renderMap(200);
    await userEvent.click(screen.getByRole("button", { name: /by beauty/i }));
    expect(screen.getByRole("button", { name: /by beauty/i })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/most beautiful at the centre/i)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /arranged by beauty rank/i })).toBeInTheDocument();
  });

  it("previews the work under the pointer and opens it on click", async () => {
    renderMap(200);
    const canvas = document.querySelector("canvas")!;
    const target = layoutConstellation(200, "mint")[42]!;
    const at = pointerFor(target);

    act(() => {
      fireEvent.pointerMove(canvas, { ...at, offsetX: at.clientX, offsetY: at.clientY });
    });
    const tooltip = await screen.findByRole("status");
    expect(tooltip).toHaveTextContent("#000042");
    expect(tooltip.querySelector("img")).toHaveAttribute("src", expect.stringContaining("000042_black_thumb.jpg"));

    fireEvent.click(canvas, at);
    expect(push).toHaveBeenCalledWith("/detail/42");

    fireEvent.pointerLeave(canvas);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("labels the newest work as the keyholder's and ranked works with their rank", async () => {
    renderMap(200);
    const canvas = document.querySelector("canvas")!;
    const newest = layoutConstellation(200, "mint")[199]!;
    const at = pointerFor(newest);
    fireEvent.pointerMove(canvas, { ...at, offsetX: at.clientX, offsetY: at.clientY });
    expect(await screen.findByRole("status")).toHaveTextContent(/newest · holds the key/i);

    const ranked = layoutConstellation(200, "mint")[2]!;
    const at2 = pointerFor(ranked);
    fireEvent.pointerMove(canvas, { ...at2, offsetX: at2.clientX, offsetY: at2.clientY });
    expect(await screen.findByRole("status")).toHaveTextContent(/beauty rank #1/i);
  });
});
