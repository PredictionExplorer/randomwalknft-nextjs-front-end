import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { trackEvent } = vi.hoisted(() => ({ trackEvent: vi.fn() }));
vi.mock("@/lib/analytics", () => ({ trackEvent }));

import { WingToggle } from "@/components/layout/wing-toggle";
import { useWing, WingProvider } from "@/components/providers/wing-provider";

function EditionProbe() {
  const { edition } = useWing();
  return <output data-testid="edition">{edition}</output>;
}

describe("WingToggle", () => {
  beforeEach(() => {
    trackEvent.mockReset();
    document.documentElement.dataset.wing = "dark";
    document.cookie = "rw-wing=; Max-Age=0; Path=/";
  });

  it("switches wings, updating the html attribute, cookie, and artwork edition", async () => {
    render(
      <WingProvider initialWing="dark">
        <WingToggle />
        <EditionProbe />
      </WingProvider>
    );

    const toggle = screen.getByRole("switch", { name: /switch to the light wing/i });
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(screen.getByTestId("edition")).toHaveTextContent("black");

    await userEvent.click(toggle);

    expect(screen.getByRole("switch", { name: /switch to the dark wing/i })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByTestId("edition")).toHaveTextContent("white");
    expect(document.documentElement.dataset.wing).toBe("light");
    expect(document.cookie).toContain("rw-wing=light");
    expect(trackEvent).toHaveBeenCalledWith("wing_changed", { wing: "light" });
  });

  it("starts in the wing the pre-paint bootstrap wrote onto <html>", () => {
    document.documentElement.dataset.wing = "light";
    render(
      <WingProvider initialWing="dark">
        <WingToggle />
      </WingProvider>
    );

    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });

  it("falls back to the given wing when the document carries none", () => {
    delete document.documentElement.dataset.wing;
    render(
      <WingProvider initialWing="light">
        <WingToggle />
      </WingProvider>
    );

    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });
});
