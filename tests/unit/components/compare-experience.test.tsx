import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CompareExperience } from "@/components/feature/compare-experience";
import { server } from "../../setup/msw/server";

const signMessageAsync = vi.fn();

vi.mock("wagmi", () => ({
  useAccount: () => ({
    address: "0x0000000000000000000000000000000000000001",
    isConnected: true
  }),
  useSignMessage: () => ({ signMessageAsync })
}));

vi.mock("@/lib/web3/evm-chain", async () => {
  const actual = await vi.importActual<typeof import("@/lib/web3/evm-chain")>("@/lib/web3/evm-chain");
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
    signMessageAsync.mockResolvedValue(("0x" + "11".repeat(65)) as `0x${string}`);
  });

  it("renders loading skeleton initially", () => {
    server.use(
      http.get("/api/compare", () =>
        HttpResponse.json({ tokenIds: [1, 2], totalCount: 42, signNonce: "n" })
      )
    );

    render(<CompareExperience />, { wrapper: Wrapper });
    expect(screen.getByText("WHICH")).toBeInTheDocument();
  });

  it("renders two pick buttons after data loads", async () => {
    server.use(
      http.get("/api/compare", () =>
        HttpResponse.json({ tokenIds: [10, 20], totalCount: 5, signNonce: "n" })
      )
    );

    render(<CompareExperience />, { wrapper: Wrapper });

    expect(await screen.findByText("Pick 10")).toBeInTheDocument();
    expect(screen.getByText("Pick 20")).toBeInTheDocument();
    expect(screen.getByText("5 votes")).toBeInTheDocument();
  });

  it("submits a vote when pick button is clicked", async () => {
    let votedPayload: unknown = null;

    server.use(
      http.get("/api/compare", () =>
        HttpResponse.json({ tokenIds: [3, 7], totalCount: 10, signNonce: "nonce-xyz" })
      ),
      http.post("/api/compare", async ({ request }) => {
        votedPayload = await request.json();
        return HttpResponse.json({ result: "success" });
      })
    );

    const user = userEvent.setup();
    render(<CompareExperience />, { wrapper: Wrapper });

    const pickButton = await screen.findByText("Pick 3");
    await user.click(pickButton);

    expect(signMessageAsync).toHaveBeenCalled();
    expect(votedPayload).toMatchObject({
      firstId: 3,
      secondId: 7,
      winner: 3,
      signNonce: "nonce-xyz",
      chainId: 31337
    });
  });

  it("returns null when tokenIds array is empty", async () => {
    server.use(
      http.get("/api/compare", () =>
        HttpResponse.json({ tokenIds: [], totalCount: 0, signNonce: "n" })
      )
    );

    const { container } = render(<CompareExperience />, { wrapper: Wrapper });
    await vi.waitFor(() => {
      expect(container.querySelector("[class*='space-y-8']")).not.toBeInTheDocument();
    });
  });

  it("shows error toast when vote fails", async () => {
    server.use(
      http.get("/api/compare", () =>
        HttpResponse.json({ tokenIds: [5, 8], totalCount: 3, signNonce: "n" })
      ),
      http.post("/api/compare", () =>
        new HttpResponse(null, { status: 500 })
      )
    );

    const user = userEvent.setup();
    render(<CompareExperience />, { wrapper: Wrapper });

    const pickButton = await screen.findByText("Pick 5");
    await user.click(pickButton);

    await vi.waitFor(() => {
      expect(pickButton).not.toBeDisabled();
    });
  });

  it("throws when fetch response is not ok", async () => {
    server.use(
      http.get("/api/compare", () =>
        new HttpResponse(null, { status: 500 })
      )
    );

    render(<CompareExperience />, { wrapper: Wrapper });
    expect(screen.getByText("WHICH")).toBeInTheDocument();
  });
});
