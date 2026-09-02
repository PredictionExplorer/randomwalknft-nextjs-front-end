import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as MotionReact from "motion/react";

import { VaultChapter } from "@/components/feature/vault-chapter";
import type { RecentMint, VaultState } from "@/lib/types";

vi.mock("motion/react", async () => {
  const actual = await vi.importActual<typeof MotionReact>("motion/react");
  return { ...actual, useInView: () => true, useReducedMotion: () => true };
});

const vault: VaultState = {
  prizeEth: 40.68,
  prizeWei: "40680000000000000000",
  secondsUntilWithdrawal: 86_400 * 2 + 3_600,
  lastMinter: "0xB2251e8fd8EbaA3882b5D121a29Db228A1a450eC",
  lastMintAtMs: Date.now() - 2 * 86_400_000,
  mintPriceEth: 0.0905,
  mintedCount: 4097,
  numWithdrawals: 0,
  readAtMs: Date.now()
};

const recentMints: RecentMint[] = [
  { id: 4096, minter: "0xB2251e8fd8EbaA3882b5D121a29Db228A1a450eC", mintedAtMs: Date.now() - 2 * 86_400_000 },
  { id: 4095, minter: "0x1111111111111111111111111111111111111111", mintedAtMs: Date.now() - 5 * 86_400_000 },
  { id: 4094, minter: "0x2222222222222222222222222222222222222222" }
];

describe("VaultChapter", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it("shows the prize, the keyholder, the clock, and the acquisitions feed", () => {
    render(<VaultChapter vault={vault} recentMints={recentMints} keyholderTokenId={4096} />);

    expect(screen.getByTestId("vault-chapter-prize")).toHaveTextContent("40.68");
    expect(screen.getByText(/450× the price of one mint/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: vault.lastMinter! })).toHaveAttribute(
      "href",
      `/gallery?address=${vault.lastMinter}`
    );
    expect(screen.getByText(/since 2 days ago/)).toBeInTheDocument();
    expect(screen.getByText(/about 2 days and 1 hour remain/i)).toBeInTheDocument();

    const feed = screen.getByTestId("recent-mints");
    expect(feed.querySelectorAll("a")).toHaveLength(3);
    expect(feed).toHaveTextContent("#004096");
    expect(feed).toHaveTextContent("5 days ago");
    vi.useRealTimers();
  });

  it("ticks the clock down each second", () => {
    render(<VaultChapter vault={{ ...vault, secondsUntilWithdrawal: 5 }} recentMints={[]} />);
    expect(screen.getByText(/about 1 minute remain/i)).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(6_000);
    });
    expect(screen.getByText(/the withdrawal window is open now/i)).toBeInTheDocument();
    expect(screen.getByText(/the vault is open/i)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("explains an empty keyholder gracefully", () => {
    render(<VaultChapter vault={{ ...vault, lastMinter: undefined }} recentMints={[]} />);
    expect(screen.getByText(/no minter recorded yet/i)).toBeInTheDocument();
    expect(screen.queryByTestId("recent-mints")).not.toBeInTheDocument();
    vi.useRealTimers();
  });
});
