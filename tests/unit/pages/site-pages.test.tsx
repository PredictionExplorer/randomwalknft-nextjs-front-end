import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as MotionReact from "motion/react";
import type * as NodeCrypto from "node:crypto";

import { ContractsProvider } from "@/components/providers/contracts-context";
import { WingProvider } from "@/components/providers/wing-provider";
import type { HomepageStats, Nft, RecentMint, VaultState } from "@/lib/types";
import { createAssetUrls } from "@/lib/utils";
import { installFakeCanvas } from "../../setup/fake-canvas";

const NFT_ADDRESS = "0x895a6F444BE4ba9d124F61DF736605792B35D66b";

const { api, publicClient, notFound } = vi.hoisted(() => ({
  api: {
    getHomepageStats: vi.fn(),
    getRatingOrder: vi.fn(),
    getRecentMints: vi.fn(),
    getRandomPair: vi.fn(),
    getVaultState: vi.fn(),
    getRandomMintedTokenIds: vi.fn(),
    getTokenDetailOrFallback: vi.fn()
  },
  publicClient: { readContract: vi.fn() },
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  })
}));

vi.mock("@/lib/api/public", () => api);
vi.mock("@/lib/web3/public-client", () => ({ getPublicClient: () => publicClient }));
vi.mock("@/lib/server/app-config", () => ({
  getAppConfig: () =>
    Promise.resolve({
      NFT_ADDRESS,
      SITE_DESCRIPTION: "Generative art drawn by chance.",
      SITE_NAME: "Random Walk NFT",
      SITE_URL: "https://randomwalknft.com",
      ASSET_BASE_URL: "https://assets.test.example.com/randomwalk"
    })
}));
vi.mock("next/navigation", () => ({
  notFound,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/"
}));
vi.mock("next/cache", () => ({ unstable_noStore: () => undefined }));
vi.mock("node:crypto", async () => {
  const actual = await vi.importActual<typeof NodeCrypto>("node:crypto");
  return { ...actual, randomUUID: () => "visit-key" };
});
vi.mock("wagmi", () => ({
  useConnection: () => ({ isConnected: false, status: "disconnected" }),
  useWalletClient: () => ({ data: undefined, error: null, isFetching: false, refetch: vi.fn() }),
  usePublicClient: () => undefined,
  useReadContract: () => ({ data: undefined, isLoading: false }),
  useWriteContract: () => ({ mutateAsync: vi.fn() }),
  useWaitForTransactionReceipt: () => ({ isLoading: false, isSuccess: false }),
  useSignMessage: () => ({ mutateAsync: vi.fn() })
}));
vi.mock("@/components/wallet/wallet-provider", () => ({
  useWalletUi: () => ({ openConnectModal: vi.fn(), openChainModal: vi.fn(), openAccountModal: vi.fn() })
}));
vi.mock("motion/react", async () => {
  const actual = await vi.importActual<typeof MotionReact>("motion/react");
  return {
    ...actual,
    useInView: () => true,
    useReducedMotion: () => true,
    useScroll: () => ({ scrollYProgress: { get: () => 0, on: () => () => undefined } })
  };
});

const vault: VaultState = {
  prizeEth: 40.68,
  prizeWei: "40680000000000000000",
  secondsUntilWithdrawal: 86_400 * 27,
  lastMinter: "0xB2251e8fd8EbaA3882b5D121a29Db228A1a450eC",
  lastMintAtMs: Date.now() - 86_400_000,
  mintPriceEth: 0.0905,
  mintedCount: 4097,
  numWithdrawals: 0,
  readAtMs: Date.now()
};

const stats: HomepageStats = {
  mintedCount: 4097,
  mintPrice: 0.0905,
  featuredTokenIds: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
  beautyTopIds: [1, 3, 5, 7, 9, 11, 13, 15],
  newestIds: [4096, 4095, 4094, 4093, 4092, 4091, 4090, 4089],
  vault
};

const recentMints: RecentMint[] = [{ id: 4096, minter: vault.lastMinter!, mintedAtMs: Date.now() - 86_400_000 }];

function buildNft(overrides: Partial<Nft> = {}): Nft {
  return {
    id: 42,
    name: "Drift",
    seed: "ab".repeat(32),
    owner: "0x1111111111111111111111111111111111111111",
    mintedAt: "2021-11-12T01:52:00.000Z",
    assets: createAssetUrls(42),
    tokenHistory: [
      { recordType: 1, timestamp: 1_636_681_920, owner: "0x2222222222222222222222222222222222222222", price: 0.0069 }
    ],
    ...overrides
  } as Nft;
}

function renderPage(ui: ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <WingProvider initialWing="dark">
        <ContractsProvider value={{ NFT_ADDRESS }}>{ui}</ContractsProvider>
      </WingProvider>
    </QueryClientProvider>
  );
}

function jsonLdTypes(container: HTMLElement) {
  return Array.from(container.querySelectorAll('script[type="application/ld+json"]')).map(
    (node) => (JSON.parse(node.textContent ?? "{}") as { "@type": string })["@type"]
  );
}

describe("site pages", () => {
  beforeEach(() => {
    installFakeCanvas();
    vi.clearAllMocks();
    api.getHomepageStats.mockResolvedValue(stats);
    api.getRatingOrder.mockResolvedValue([9, 7, 5, 3, 1]);
    api.getRecentMints.mockResolvedValue(recentMints);
    api.getRandomPair.mockResolvedValue([21, 22]);
    api.getVaultState.mockResolvedValue(vault);
    api.getRandomMintedTokenIds.mockImplementation((count: number) =>
      Promise.resolve(Array.from({ length: count }, (_, i) => 100 + i))
    );
    api.getTokenDetailOrFallback.mockResolvedValue(buildNft());
    publicClient.readContract.mockImplementation(({ functionName }: { functionName: string }) =>
      Promise.resolve(functionName === "walletOfOwner" ? [4096n, 12n] : 4097n)
    );
  });

  it("homepage composes the masthead, story, collection, vault, salon, and guide", async () => {
    const { default: HomePage } = await import("@/app/(site)/page");
    const { container } = renderPage(await HomePage());

    expect(screen.getByRole("heading", { level: 1, name: "Random Walk NFT" })).toBeInTheDocument();
    expect(screen.getByTestId("masthead-facts")).toHaveTextContent("4,097");
    expect(screen.getByTestId("walk-story")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /4,097 walks, and counting/i })).toBeInTheDocument();
    expect(screen.getByTestId("constellation")).toBeInTheDocument();
    expect(screen.getByTestId("vault-chapter")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /which is more beautiful/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /common questions/i })).toBeInTheDocument();
    expect(jsonLdTypes(container)).toEqual(expect.arrayContaining(["WebSite", "Organization"]));
  });

  it("homepage degrades without a vault or salon pair", async () => {
    api.getHomepageStats.mockResolvedValue({ ...stats, vault: null });
    api.getRandomPair.mockRejectedValue(new Error("down"));
    api.getRecentMints.mockRejectedValue(new Error("down"));
    const { default: HomePage } = await import("@/app/(site)/page");
    renderPage(await HomePage());
    expect(screen.queryByTestId("vault-chapter")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /which is more beautiful/i })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /add a walk to the collection/i })).toBeInTheDocument();
  });

  it("gallery renders the newest room, a beauty room, a wallet wall, and jump-to-token", async () => {
    const { default: GalleryPage, generateMetadata } = await import("@/app/(site)/gallery/page");

    const { unmount } = renderPage(await GalleryPage({ searchParams: Promise.resolve({}) }));
    expect(screen.getByRole("heading", { level: 1, name: /every walk, newest first/i })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /random walk nft #/i })).toHaveLength(24);
    unmount();

    renderPage(await GalleryPage({ searchParams: Promise.resolve({ sortBy: "beauty" }) }));
    expect(screen.getByRole("heading", { level: 1, name: /most beautiful/i })).toBeInTheDocument();
    expect(screen.getByText("Beauty rank #1")).toBeInTheDocument();
    screen.getByTestId("gallery-count");

    const wallet = "0x1234567890abcdef1234567890abcdef12345678";
    const { container } = renderPage(await GalleryPage({ searchParams: Promise.resolve({ address: wallet }) }));
    expect(within(container).getByRole("heading", { level: 1, name: /works held by 0x1234/i })).toBeInTheDocument();
    expect(within(container).getByText(/2 random walk nfts in this wallet/i)).toBeInTheDocument();

    expect(await generateMetadata({ searchParams: Promise.resolve({ page: "3", sortBy: "beauty" }) })).toMatchObject({
      alternates: { canonical: "/gallery?sortBy=beauty&page=3" }
    });
    expect(await generateMetadata({ searchParams: Promise.resolve({ address: wallet }) })).toMatchObject({
      robots: { index: false, follow: true }
    });
  });

  it("vault page renders the clock room and the rules, and copes without chain data", async () => {
    const { default: VaultPage } = await import("@/app/(site)/vault/page");
    const { unmount } = renderPage(await VaultPage());
    expect(screen.getByRole("heading", { level: 1, name: /the vault/i })).toBeInTheDocument();
    expect(screen.getByTestId("vault-prize")).toHaveTextContent("40.68");
    expect(screen.getByText(/never\. in \d+ years and 4,097 mints/i)).toBeInTheDocument();
    unmount();

    api.getVaultState.mockResolvedValue(null);
    renderPage(await VaultPage());
    expect(screen.getByText(/live vault data is temporarily unavailable/i)).toBeInTheDocument();
  });

  it("mint page renders the ticket desk and the featured rail", async () => {
    const { default: MintPage } = await import("@/app/(site)/mint/page");
    renderPage(await MintPage());
    expect(screen.getByRole("heading", { level: 1, name: /add a walk nobody has seen/i })).toBeInTheDocument();
    expect(screen.getByTestId("mint-panel")).toBeInTheDocument();
    expect(screen.getByTestId("mint-featured-rail").querySelectorAll("a")).toHaveLength(8);
  });

  it("atelier page seeds the studio from a valid ?seed and ignores garbage", async () => {
    const { default: AtelierPage } = await import("@/app/(site)/atelier/page");
    const seed = "0x" + "cd".repeat(32);
    const { unmount } = renderPage(await AtelierPage({ searchParams: Promise.resolve({ seed }) }));
    expect(screen.getByLabelText(/seed or text/i)).toHaveValue(seed);
    unmount();

    renderPage(await AtelierPage({ searchParams: Promise.resolve({ seed: "nonsense" }) }));
    expect(screen.getByLabelText(/seed or text/i)).toHaveValue("");
  });

  it("random rooms hang a work and link to the other room", async () => {
    const { default: RandomImagePage } = await import("@/app/(site)/random/page");
    const { unmount } = renderPage(await RandomImagePage());
    expect(screen.getByTestId("random-image")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /prefer the films/i })).toHaveAttribute("href", "/random-video");
    unmount();

    const { default: RandomVideoPage } = await import("@/app/(site)/random-video/page");
    renderPage(await RandomVideoPage());
    expect(screen.getByTestId("random-video")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /prefer the stills/i })).toHaveAttribute("href", "/random");
  });

  it("content pages render their headings and structured data", async () => {
    const { default: FaqPage } = await import("@/app/(site)/faq/page");
    const { container: faq, unmount: unmountFaq } = renderPage(FaqPage());
    expect(screen.getByRole("heading", { level: 1, name: /questions, answered/i })).toBeInTheDocument();
    expect(jsonLdTypes(faq)).toContain("FAQPage");
    unmountFaq();

    const { default: CodePage } = await import("@/app/(site)/code/page");
    const { unmount: unmountCode } = renderPage(CodePage());
    expect(screen.getByRole("heading", { level: 1, name: /open source, end to end/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /how to reproduce/i })).toBeInTheDocument();
    unmountCode();

    const { default: HowItWorksPage } = await import("@/app/(site)/how-it-works/page");
    const { container: how } = renderPage(await HowItWorksPage());
    expect(screen.getByRole("heading", { level: 1, name: /how random walk nft works/i })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: /in this guide/i })).toBeInTheDocument();
    expect(jsonLdTypes(how)).toContain("Article");

    const { default: ComparePage } = await import("@/app/(site)/compare/page");
    renderPage(ComparePage());
    expect(screen.getByRole("heading", { level: 1, name: /which is more beautiful/i })).toBeInTheDocument();

    const { default: MyNftsPage } = await import("@/app/(dashboard)/my-nfts/page");
    renderPage(MyNftsPage());
    expect(screen.getByRole("heading", { level: 1, name: /my random walks/i })).toBeInTheDocument();
  });

  it("token page renders the stage, provenance, and metadata; unknown tokens 404", async () => {
    const { default: DetailPage, generateMetadata } = await import("@/app/(site)/detail/[id]/page");
    const { container } = renderPage(
      await DetailPage({
        params: Promise.resolve({ id: "42" }),
        searchParams: Promise.resolve({ media: "singleVideo" })
      })
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("#000042 · Drift");
    expect(screen.getByTestId("artwork-stage")).toBeInTheDocument();
    expect(screen.getByTestId("artwork-video")).toBeInTheDocument();
    expect(screen.getByTestId("provenance")).toBeInTheDocument();
    expect(jsonLdTypes(container)).toContain("VisualArtwork");
    expect(api.getTokenDetailOrFallback).toHaveBeenCalledWith(42, { fresh: false });

    expect(await generateMetadata({ params: Promise.resolve({ id: "42" }) })).toMatchObject({
      title: "#000042 “Drift”",
      alternates: { canonical: "/detail/42" }
    });
    expect(await generateMetadata({ params: Promise.resolve({ id: "nope" }) })).toMatchObject({
      robots: { index: false }
    });

    api.getTokenDetailOrFallback.mockResolvedValue(null);
    await expect(
      DetailPage({ params: Promise.resolve({ id: "99999" }), searchParams: Promise.resolve({}) })
    ).rejects.toThrow("NEXT_NOT_FOUND");
    await expect(
      DetailPage({ params: Promise.resolve({ id: "-1" }), searchParams: Promise.resolve({}) })
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("token page treats a just-minted token as pending and reads it fresh", async () => {
    api.getTokenDetailOrFallback.mockResolvedValue(buildNft({ isPendingMetadata: true, tokenHistory: [], name: "" }));
    const { default: DetailPage } = await import("@/app/(site)/detail/[id]/page");
    renderPage(
      await DetailPage({ params: Promise.resolve({ id: "42" }), searchParams: Promise.resolve({ message: "success" }) })
    );
    expect(api.getTokenDetailOrFallback).toHaveBeenCalledWith(42, { fresh: true });
    expect(screen.getByText(/freshly minted/i)).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/rendering/i);
  });

  it("not-found page invites the visitor back into the collection", async () => {
    const { default: NotFound } = await import("@/app/not-found");
    renderPage(NotFound());
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /gallery|collection/i })).toBeInTheDocument();
  });
});
