import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";

import { HeroExhibit } from "@/components/feature/hero-exhibit";
import { server } from "../../setup/msw/server";

describe("HeroExhibit", () => {
  it("renders a video with the initial token source and a museum label", () => {
    const { container } = render(
      <HeroExhibit initialTokenId={42} initialOwner="0x1234567890abcdef1234567890abcdef12345678" />
    );
    const video = container.querySelector("video");
    expect(video).toBeInTheDocument();
    const source = container.querySelector("source");
    expect(source?.getAttribute("src")).toContain("000042_black_triple.mp4");

    const label = screen.getByTestId("hero-exhibit-label");
    expect(label).toHaveAttribute("href", "/detail/42");
    expect(label).toHaveTextContent("#000042");
    expect(label).toHaveTextContent(/collected by 0x1234/i);
  });

  it("does not have the loop attribute", () => {
    const { container } = render(<HeroExhibit initialTokenId={1} />);
    const video = container.querySelector("video");
    expect(video).not.toHaveAttribute("loop");
  });

  it("rotates to a new random token when the film ends", async () => {
    server.use(
      http.get("/api/random-token", () =>
        HttpResponse.json({ tokenId: 99, totalSupply: 200 })
      )
    );

    const playSpy = vi.fn().mockResolvedValue(undefined);
    const loadSpy = vi.fn();

    const { container } = render(<HeroExhibit initialTokenId={5} initialOwner="0xabc" />);
    const video = container.querySelector("video")!;

    Object.defineProperty(video, "play", { value: playSpy });
    Object.defineProperty(video, "load", { value: loadSpy });

    await act(async () => {
      fireEvent.ended(video);
      await vi.waitFor(() => {
        expect(loadSpy).toHaveBeenCalled();
      });
    });

    expect(playSpy).toHaveBeenCalled();
    // The label follows the rotation and drops the now-stale owner line.
    expect(screen.getByTestId("hero-exhibit-label")).toHaveTextContent("#000099");
    expect(screen.getByTestId("hero-exhibit-label")).not.toHaveTextContent(/collected by/i);
  });

  it("does not crash if the fetch fails on video end", async () => {
    server.use(
      http.get("/api/random-token", () => new HttpResponse(null, { status: 500 }))
    );

    const { container } = render(<HeroExhibit initialTokenId={5} />);
    const video = container.querySelector("video")!;

    expect(() => fireEvent.ended(video)).not.toThrow();

    const source = container.querySelector("source");
    expect(source?.getAttribute("src")).toContain("000005_black_triple.mp4");
  });
});
