import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";

import { HeroVideo } from "@/components/feature/hero-video";
import { server } from "../../setup/msw/server";

describe("HeroVideo", () => {
  it("renders a video with the initial token source", () => {
    const { container } = render(<HeroVideo initialTokenId={42} />);
    const video = container.querySelector("video");
    expect(video).toBeInTheDocument();
    const source = container.querySelector("source");
    expect(source?.getAttribute("src")).toContain("000042_black_triple.mp4");
  });

  it("does not have the loop attribute", () => {
    const { container } = render(<HeroVideo initialTokenId={1} />);
    const video = container.querySelector("video");
    expect(video).not.toHaveAttribute("loop");
  });

  it("fetches a new random token when the video ends", async () => {
    server.use(
      http.get("/api/random-token", () =>
        HttpResponse.json({ tokenId: 99, totalSupply: 200 })
      )
    );

    const playSpy = vi.fn().mockResolvedValue(undefined);
    const loadSpy = vi.fn();

    const { container } = render(<HeroVideo initialTokenId={5} />);
    const video = container.querySelector("video")!;

    Object.defineProperty(video, "play", { value: playSpy });
    Object.defineProperty(video, "load", { value: loadSpy });

    fireEvent.ended(video);

    await vi.waitFor(() => {
      expect(loadSpy).toHaveBeenCalled();
    });
    expect(playSpy).toHaveBeenCalled();
  });

  it("does not crash if the fetch fails on video end", async () => {
    server.use(
      http.get("/api/random-token", () =>
        new HttpResponse(null, { status: 500 })
      )
    );

    const { container } = render(<HeroVideo initialTokenId={5} />);
    const video = container.querySelector("video")!;

    expect(() => fireEvent.ended(video)).not.toThrow();

    const source = container.querySelector("source");
    expect(source?.getAttribute("src")).toContain("000005_black_triple.mp4");
  });
});
