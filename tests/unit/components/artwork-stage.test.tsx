import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ArtworkStage } from "@/components/detail/artwork-stage";
import { WingProvider } from "@/components/providers/wing-provider";
import type { Wing } from "@/lib/wing";
import { createAssetUrls } from "@/lib/utils";
import { server } from "../../setup/msw/server";

vi.mock("@/components/feature/walk-canvas", () => ({
  WalkCanvas: ({ seed, label }: { seed: string; label: string }) => (
    <canvas data-testid="walk-canvas" data-seed={seed} aria-label={label} />
  )
}));

const SEED = "0x" + "ab".repeat(32);

function renderStage(props: Partial<React.ComponentProps<typeof ArtworkStage>> = {}, wing: Wing = "dark") {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <WingProvider initialWing={wing}>
        <ArtworkStage tokenId={7} seed={SEED} assets={createAssetUrls(7)} pending={false} {...props} />
      </WingProvider>
    </QueryClientProvider>
  );
}

describe("ArtworkStage", () => {
  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, "requestFullscreen", {
      configurable: true,
      value: vi.fn().mockResolvedValue(undefined)
    });
  });

  it("shows the still of the wing's edition and switches to the films", async () => {
    renderStage();
    const still = screen.getByRole("img", { name: /random walk nft #000007, black edition/i });
    expect(still).toHaveAttribute("src", expect.stringContaining("000007_black.png"));
    expect(screen.getByTestId("media-image")).toHaveAttribute("aria-pressed", "true");

    await userEvent.click(screen.getByTestId("media-tripleVideo"));
    const video = screen.getByTestId("artwork-video");
    expect(video.querySelector("source")).toHaveAttribute("src", expect.stringContaining("000007_black_triple.mp4"));
    expect(video).toHaveAttribute("poster", expect.stringContaining("000007_black_thumb.jpg"));
  });

  it("follows the light wing but lets the visitor override the edition", async () => {
    renderStage({}, "light");
    expect(screen.getByRole("img")).toHaveAttribute("src", expect.stringContaining("_white.png"));

    await userEvent.click(screen.getByRole("button", { name: /^black edition$/i }));
    expect(screen.getByRole("img")).toHaveAttribute("src", expect.stringContaining("_black.png"));
  });

  it("honours the initial media and edition from the URL", () => {
    renderStage({ initialMedia: "singleVideo", initialEdition: "white" });
    expect(screen.getByTestId("artwork-video").querySelector("source")).toHaveAttribute(
      "src",
      expect.stringContaining("000007_white_single.mp4")
    );
  });

  it("redraws the work live from its seed on request", async () => {
    renderStage();
    await userEvent.click(screen.getByTestId("proof-toggle"));
    expect(screen.getByTestId("walk-canvas")).toHaveAttribute("data-seed", SEED);
    expect(screen.getByText(/drawn live from the seed/i)).toBeInTheDocument();
  });

  it("answers keyboard shortcuts for media, zoom, and immersive mode", async () => {
    renderStage();
    fireEvent.keyDown(document.body, { key: "2" });
    expect(screen.getByTestId("artwork-video").querySelector("source")).toHaveAttribute(
      "src",
      expect.stringContaining("_single.mp4")
    );
    fireEvent.keyDown(document.body, { key: "1" });
    expect(screen.getByRole("img")).toBeInTheDocument();

    fireEvent.keyDown(document.body, { key: "i" });
    expect(HTMLElement.prototype.requestFullscreen).toHaveBeenCalled();

    fireEvent.keyDown(document.body, { key: "z" });
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
  });

  it("keeps the still while films render for a pending token, then unlocks them", async () => {
    server.use(
      http.head("/api/assets/:file", ({ params }) => {
        const file = String(params.file);
        return new HttpResponse(null, {
          status: 200,
          headers: { "x-asset-status": file.endsWith(".png") ? "ready" : "placeholder" }
        });
      })
    );
    renderStage({ pending: true });

    expect(screen.getByRole("status")).toHaveTextContent(/rendering/i);
    await waitFor(() => expect(screen.getByTestId("media-image")).toBeEnabled());
    expect(screen.getByTestId("media-singleVideo")).toBeDisabled();
    expect(screen.getByTestId("media-tripleVideo")).toBeDisabled();
  });
});
