import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AtelierStudio } from "@/components/feature/atelier-studio";
import { MintRevealTheater } from "@/components/feature/mint-reveal-theater";
import { WingProvider } from "@/components/providers/wing-provider";
import { seedFromInput } from "@/lib/walk/walk-engine";
import { installFakeCanvas } from "../../setup/fake-canvas";

const { router, trackEvent } = vi.hoisted(() => ({
  router: { replace: vi.fn(), push: vi.fn(), refresh: vi.fn() },
  trackEvent: vi.fn()
}));
vi.mock("next/navigation", () => ({ useRouter: () => router, usePathname: () => "/atelier" }));
vi.mock("@/lib/analytics", () => ({ trackEvent }));

const SEED = "0x" + "ab".repeat(32);

describe("AtelierStudio", () => {
  beforeEach(() => {
    installFakeCanvas();
    vi.clearAllMocks();
    // Draw instantly so "complete" states are reachable.
    window.matchMedia = vi
      .fn()
      .mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
  });

  it("starts from a shared seed, shows it, and enables download once drawn", async () => {
    render(
      <WingProvider initialWing="dark">
        <AtelierStudio initialSeed={SEED} />
      </WingProvider>
    );
    expect(screen.getByTitle(SEED)).toBeInTheDocument();
    expect(screen.getByLabelText(/seed or text/i)).toHaveValue(SEED);
    expect(screen.getByRole("button", { name: /download png/i })).toBeDisabled();

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 60));
    });
    expect(screen.getByText(/walk complete/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /download png/i })).toBeEnabled();
  });

  it("hashes free text into a seed and puts it in the URL", async () => {
    render(<AtelierStudio />);
    await userEvent.type(screen.getByLabelText(/seed or text/i), "a name, a date, a sentence");
    await userEvent.click(screen.getByTestId("atelier-draw"));

    const expected = seedFromInput("a name, a date, a sentence");
    expect(screen.getByTitle(expected)).toBeInTheDocument();
    expect(router.replace).toHaveBeenCalledWith(`/atelier?seed=${expected}`, { scroll: false });
    expect(trackEvent).toHaveBeenCalledWith("atelier_draw", { source: "input", surface: "atelier" });
  });

  it("rolls a random seed and can show both editions side by side", async () => {
    render(<AtelierStudio />);
    const before = screen.getByTitle(/^0x[0-9a-f]{64}$/).textContent;
    await userEvent.click(screen.getByTestId("atelier-random"));
    expect(screen.getByTitle(/^0x[0-9a-f]{64}$/).textContent).not.toBe(before);

    expect(document.querySelectorAll("canvas")).toHaveLength(1);
    await userEvent.click(screen.getByRole("button", { name: /both editions/i }));
    expect(document.querySelectorAll("canvas")).toHaveLength(2);
    expect(screen.getByRole("img", { name: /white edition/i })).toBeInTheDocument();
  });

  it("drops the seed form and URL syncing in compact mode", async () => {
    render(<AtelierStudio compact />);
    expect(screen.queryByLabelText(/seed or text/i)).not.toBeInTheDocument();
    await userEvent.click(screen.getByTestId("atelier-redraw"));
    expect(router.replace).not.toHaveBeenCalled();
    expect(trackEvent).toHaveBeenCalledWith("atelier_draw", { source: "redraw", surface: "embedded" });
  });
});

describe("MintRevealTheater", () => {
  it("names the new work, draws it from its seed, and offers the way out", async () => {
    installFakeCanvas();
    window.matchMedia = vi
      .fn()
      .mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() });
    const onView = vi.fn();
    render(<MintRevealTheater tokenId={4097} seed={SEED} onView={onView} />);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent("#004097");
    expect(dialog).toHaveTextContent(SEED);
    expect(screen.getByTestId("mint-reveal-view")).toHaveTextContent(/skip to your work/i);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 60));
    });
    expect(screen.getByTestId("mint-reveal-view")).toHaveTextContent(/view your work in the collection/i);
    await userEvent.click(screen.getByTestId("mint-reveal-view"));
    expect(onView).toHaveBeenCalledTimes(1);
  });
});
