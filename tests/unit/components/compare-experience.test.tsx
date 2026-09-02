import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CompareExperience } from "@/components/feature/compare-experience";
import { server } from "../../setup/msw/server";

const signMessageAsync = vi.fn();
const walletClient = {
  account: {
    address: "0x0000000000000000000000000000000000000001"
  }
};
const { connection, openConnectModal } = vi.hoisted(() => ({
  connection: {
    address: "0x0000000000000000000000000000000000000001",
    chain: { id: 31337 },
    chainId: 31337,
    isConnected: true,
    isConnecting: false,
    isReconnecting: false,
    status: "connected"
  },
  openConnectModal: vi.fn()
}));

vi.mock("wagmi", () => ({
  useConnection: () => connection,
  useSignMessage: () => ({ mutateAsync: signMessageAsync }),
  useWalletClient: () => ({
    data: walletClient,
    error: null,
    isFetching: false,
    refetch: vi.fn().mockResolvedValue({ data: walletClient })
  })
}));

vi.mock("@/components/wallet/wallet-provider", () => ({
  useWalletUi: () => ({ openConnectModal, openChainModal: vi.fn(), openAccountModal: vi.fn() })
}));

vi.mock("@/lib/web3/evm-chain", async () => {
  const actual = await vi.importActual("@/lib/web3/evm-chain");
  return {
    ...actual,
    getConfiguredEvmChain: () => ({ id: 31337 })
  };
});

function Wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe("CompareExperience", () => {
  beforeEach(() => {
    signMessageAsync.mockReset().mockResolvedValue("0x" + "11".repeat(65));
    openConnectModal.mockReset();
    Object.assign(connection, {
      address: "0x0000000000000000000000000000000000000001",
      chain: { id: 31337 },
      chainId: 31337,
      isConnected: true,
      status: "connected"
    });
  });

  it("renders the salon heading and a loading pair first", () => {
    server.use(http.get("/api/compare", () => HttpResponse.json({ tokenIds: [1, 2], totalCount: 42, signNonce: "n" })));

    render(<CompareExperience />, { wrapper: Wrapper });
    expect(screen.getByRole("heading", { level: 1, name: /which is more beautiful/i })).toBeInTheDocument();
    expect(screen.queryByTestId("salon-pair")).not.toBeInTheDocument();
  });

  it("renders two pick buttons and the tally after data loads", async () => {
    server.use(
      http.get("/api/compare", () => HttpResponse.json({ tokenIds: [10, 20], totalCount: 5, signNonce: "n" }))
    );

    render(<CompareExperience />, { wrapper: Wrapper });

    expect(await screen.findByRole("button", { name: /pick 10/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /pick 20/i })).toBeInTheDocument();
    expect(screen.getByTestId("salon-tally")).toHaveTextContent("5");
  });

  it("signs and submits a vote when a pick button is clicked, then counts the session", async () => {
    let votedPayload: unknown = null;

    server.use(
      http.get("/api/compare", () => HttpResponse.json({ tokenIds: [3, 7], totalCount: 10, signNonce: "nonce-xyz" })),
      http.post("/api/compare", async ({ request }) => {
        votedPayload = await request.json();
        return HttpResponse.json({ result: "success" });
      })
    );

    const user = userEvent.setup();
    render(<CompareExperience />, { wrapper: Wrapper });

    await user.click(await screen.findByTestId("pick-left"));

    expect(signMessageAsync).toHaveBeenCalled();
    expect(votedPayload).toMatchObject({
      firstId: 3,
      secondId: 7,
      winner: 3,
      signNonce: "nonce-xyz",
      chainId: 31337
    });
    await waitFor(() => expect(screen.getByTestId("salon-tally")).toHaveTextContent(/your session\s*1|1/i));
  });

  it("picks with the arrow keys", async () => {
    let votedPayload: unknown = null;
    server.use(
      http.get("/api/compare", () => HttpResponse.json({ tokenIds: [3, 7], totalCount: 10, signNonce: "n" })),
      http.post("/api/compare", async ({ request }) => {
        votedPayload = await request.json();
        return HttpResponse.json({ result: "success" });
      })
    );

    render(<CompareExperience />, { wrapper: Wrapper });
    await screen.findByTestId("salon-pair");

    fireEvent.keyDown(document.body, { key: "ArrowRight" });
    await waitFor(() => expect(votedPayload).toMatchObject({ winner: 7 }));
  });

  it("asks a disconnected visitor to connect instead of failing silently", async () => {
    Object.assign(connection, { address: undefined, isConnected: false, status: "disconnected" });
    server.use(http.get("/api/compare", () => HttpResponse.json({ tokenIds: [3, 7], totalCount: 10, signNonce: "n" })));

    const user = userEvent.setup();
    render(<CompareExperience />, { wrapper: Wrapper });
    await user.click(await screen.findByTestId("pick-left"));

    expect(openConnectModal).toHaveBeenCalledTimes(1);
    expect(signMessageAsync).not.toHaveBeenCalled();
  });

  it("keeps showing the skeleton when the pair is empty", async () => {
    server.use(http.get("/api/compare", () => HttpResponse.json({ tokenIds: [], totalCount: 0, signNonce: "n" })));

    render(<CompareExperience />, { wrapper: Wrapper });
    await waitFor(() => expect(screen.getByTestId("salon-tally")).toHaveTextContent("0"));
    expect(screen.queryByTestId("salon-pair")).not.toBeInTheDocument();
  });

  it("re-enables the buttons after a failed vote", async () => {
    server.use(
      http.get("/api/compare", () => HttpResponse.json({ tokenIds: [5, 8], totalCount: 3, signNonce: "n" })),
      http.post("/api/compare", () => new HttpResponse(null, { status: 500 }))
    );

    const user = userEvent.setup();
    render(<CompareExperience />, { wrapper: Wrapper });

    const pickButton = await screen.findByTestId("pick-left");
    await user.click(pickButton);

    await waitFor(() => {
      expect(pickButton).not.toBeDisabled();
    });
  });

  it("offers to relax the pair filter when every pair has been judged", async () => {
    server.use(
      http.get("/api/compare", () =>
        HttpResponse.json({ tokenIds: [5, 8], totalCount: 3, signNonce: "n", pairExhausted: true })
      )
    );

    render(<CompareExperience />, { wrapper: Wrapper });
    expect(await screen.findByRole("button", { name: /show random pair anyway/i })).toBeInTheDocument();
    expect(screen.getByTestId("pick-left")).toBeDisabled();
  });
});
