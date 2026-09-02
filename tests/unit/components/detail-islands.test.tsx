import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PendingRefresh } from "@/components/detail/pending-refresh";
import { ShareActions } from "@/components/detail/share-actions";
import { WingProvider } from "@/components/providers/wing-provider";
import { createAssetUrls } from "@/lib/utils";

const { router, toast } = vi.hoisted(() => ({
  router: { push: vi.fn(), replace: vi.fn(), refresh: vi.fn() },
  toast: { success: vi.fn(), error: vi.fn() }
}));
vi.mock("next/navigation", () => ({ useRouter: () => router, usePathname: () => "/detail/42" }));
vi.mock("sonner", () => ({ toast }));

describe("ShareActions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("offers same-origin downloads for the wing's edition and copies the page link", async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
    render(
      <WingProvider initialWing="light">
        <ShareActions
          tokenId={42}
          name="Drift"
          assets={createAssetUrls(42)}
          pageUrl="https://randomwalknft.com/detail/42"
        />
      </WingProvider>
    );

    expect(screen.getByRole("link", { name: /png · white/i })).toHaveAttribute("href", "/api/assets/000042_white.png");
    expect(screen.getByRole("link", { name: /film · white/i })).toHaveAttribute(
      "href",
      "/api/assets/000042_white_triple.mp4"
    );
    expect(screen.getByRole("link", { name: /png · white/i })).toHaveAttribute("download");

    await userEvent.click(screen.getByRole("button", { name: /copy link/i }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("https://randomwalknft.com/detail/42");
    expect(toast.success).toHaveBeenCalledWith("Link copied.");

    await userEvent.click(screen.getByRole("button", { name: /copy image address/i }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining("000042_white.png"));
  });

  it("shows the native share button only when the browser supports it", () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { share });
    render(
      <ShareActions tokenId={1} name="" assets={createAssetUrls(1)} pageUrl="https://randomwalknft.com/detail/1" />
    );
    expect(screen.getByRole("button", { name: /^share$/i })).toBeInTheDocument();
    Object.assign(navigator, { share: undefined });
  });
});

describe("PendingRefresh", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it("strips the one-shot success message and refreshes while the token is pending", () => {
    const { rerender } = render(<PendingRefresh pending justMinted plaque="Minted 2021" />);
    expect(router.replace).toHaveBeenCalledWith("/detail/42", { scroll: false });
    expect(screen.getByTestId("token-plaque")).toHaveTextContent(/freshly minted/i);
    // The URL cleanup re-renders without the flag; the notice stays.
    rerender(<PendingRefresh pending justMinted={false} plaque="Minted 2021" />);
    expect(screen.getByTestId("token-plaque")).toHaveTextContent(/freshly minted/i);

    act(() => {
      vi.advanceTimersByTime(15_000);
    });
    expect(router.refresh).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it("does nothing for a settled token", () => {
    render(<PendingRefresh pending={false} justMinted={false} plaque="Minted 2021" />);
    expect(screen.getByTestId("token-plaque")).toHaveTextContent("Minted 2021");
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(router.replace).not.toHaveBeenCalled();
    expect(router.refresh).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
