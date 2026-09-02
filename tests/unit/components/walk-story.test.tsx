import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as MotionReact from "motion/react";

import { WalkStory } from "@/components/feature/walk-story";
import { WingProvider } from "@/components/providers/wing-provider";
import { installFakeCanvas } from "../../setup/fake-canvas";

const { scroll, trackEvent } = vi.hoisted(() => ({
  scroll: { listeners: [] as Array<(value: number) => void>, value: 0 },
  trackEvent: vi.fn()
}));

vi.mock("@/lib/analytics", () => ({ trackEvent }));
vi.mock("motion/react", async () => {
  const actual = await vi.importActual<typeof MotionReact>("motion/react");
  return {
    ...actual,
    useReducedMotion: () => false,
    // A controllable stand-in for the section's scroll progress.
    useScroll: () => ({
      scrollYProgress: {
        get: () => scroll.value,
        on: (_event: string, listener: (value: number) => void) => {
          scroll.listeners.push(listener);
          return () => {
            scroll.listeners = scroll.listeners.filter((entry) => entry !== listener);
          };
        }
      }
    })
  };
});

function scrollTo(progress: number) {
  scroll.value = progress;
  act(() => {
    for (const listener of scroll.listeners) listener(progress);
  });
}

describe("WalkStory", () => {
  let fake: ReturnType<typeof installFakeCanvas>;

  beforeEach(() => {
    fake = installFakeCanvas();
    scroll.listeners = [];
    scroll.value = 0;
    trackEvent.mockReset();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  async function renderStory() {
    const view = render(
      <WingProvider initialWing="dark">
        <WalkStory mintedCount={4097} />
      </WingProvider>
    );
    // The canvas generates its walk one tick after mount.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });
    return view;
  }

  it("renders the four chapters as real, readable copy with the collection count", async () => {
    await renderStory();
    expect(screen.getByRole("heading", { level: 2, name: /how a random walk is born/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /every walk begins with a seed/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /sha3-256 turns the seed into steps/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /three colours drift alongside/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /until it fills the frame/i })).toBeInTheDocument();
    expect(screen.getByText(/4,097 like it exist forever on-chain/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open the atelier/i })).toHaveAttribute("href", "/atelier");
    expect(screen.getByRole("link", { name: /mint a real one/i })).toHaveAttribute("href", "/mint");
    vi.useRealTimers();
  });

  it("paints more of the walk as the visitor scrolls and swaps the overlays by chapter", async () => {
    await renderStory();
    const context = fake.contexts[0]!;
    const paintsAtStart = context.calls.filter((call) => call === "putImageData").length;

    scrollTo(0.05);
    expect(screen.getByText("seed").parentElement).toHaveClass("opacity-100");

    scrollTo(0.3);
    expect(screen.getByText("bits → step").parentElement).toHaveClass("opacity-100");
    expect(screen.getByText("seed").parentElement).toHaveClass("opacity-0");

    scrollTo(0.7);
    expect(screen.getByText(/red · green · blue drift/i).parentElement).toHaveClass("opacity-100");

    scrollTo(1);
    expect(context.calls.filter((call) => call === "putImageData").length).toBeGreaterThan(paintsAtStart + 2);
    expect(screen.getByText(/untitled walk · not minted/i)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("draws another walk on request and tracks it", async () => {
    await renderStory();
    const canvasesBefore = fake.getContext.mock.calls.length;

    await userEvent.click(screen.getByTestId("story-redraw"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });

    expect(trackEvent).toHaveBeenCalledWith("atelier_draw", { source: "redraw", surface: "homepage" });
    expect(fake.getContext.mock.calls.length).toBeGreaterThan(canvasesBefore);
    vi.useRealTimers();
  });
});
