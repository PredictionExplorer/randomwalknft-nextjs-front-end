import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { RandomImageExperience } from "@/components/feature/random-image-experience";
import { RandomVideoExperience } from "@/components/feature/random-video-experience";
import { WingProvider } from "@/components/providers/wing-provider";
import { server } from "../../setup/msw/server";

function queueRandomTokens(ids: number[]) {
  const queue = [...ids];
  server.use(
    http.get("/api/random-token", () => HttpResponse.json({ tokenId: queue.shift() ?? ids.at(-1), totalSupply: 4097 }))
  );
}

describe("RandomImageExperience", () => {
  it("hangs the initial work in the wing's edition and links to it", () => {
    render(
      <WingProvider initialWing="light">
        <RandomImageExperience initialTokenId={12} />
      </WingProvider>
    );
    expect(screen.getByRole("img", { name: /#000012, white edition/i })).toHaveAttribute(
      "src",
      expect.stringContaining("000012_white.png")
    );
    expect(screen.getByRole("link", { name: /#000012/ })).toHaveAttribute("href", "/detail/12");
    expect(screen.getByRole("button", { name: /previous work/i })).toBeDisabled();
  });

  it("shuffles forward and walks back through the visit's history", async () => {
    queueRandomTokens([77, 78]);
    render(<RandomImageExperience initialTokenId={12} />);

    await userEvent.click(screen.getByTestId("random-next"));
    await waitFor(() => expect(screen.getByRole("link", { name: /#000077/ })).toBeInTheDocument());

    fireEvent.keyDown(document.body, { key: "ArrowRight" });
    await waitFor(() => expect(screen.getByRole("link", { name: /#000078/ })).toBeInTheDocument());

    fireEvent.keyDown(document.body, { key: "ArrowLeft" });
    await waitFor(() => expect(screen.getByRole("link", { name: /#000077/ })).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /previous work/i })).toBeEnabled();
  });
});

describe("RandomVideoExperience", () => {
  it("plays the single-walker film and advances when it ends", async () => {
    queueRandomTokens([5]);
    Object.defineProperty(HTMLMediaElement.prototype, "load", { configurable: true, value: vi.fn() });
    Object.defineProperty(HTMLMediaElement.prototype, "play", {
      configurable: true,
      value: vi.fn().mockResolvedValue(undefined)
    });

    const { container } = render(<RandomVideoExperience initialTokenId={3} />);
    const source = container.querySelector("video source");
    expect(source).toHaveAttribute("src", expect.stringContaining("000003_black_single.mp4"));

    fireEvent.ended(container.querySelector("video")!);
    await waitFor(() => expect(screen.getByRole("link", { name: /#000005/ })).toBeInTheDocument());
    expect(container.querySelector("video source")).toHaveAttribute(
      "src",
      expect.stringContaining("000005_black_single.mp4")
    );
  });
});
