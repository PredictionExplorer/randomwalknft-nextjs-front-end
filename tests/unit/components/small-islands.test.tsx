import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CodeArtifactCard } from "@/components/code/code-artifact-card";
import { IpfsLink } from "@/components/code/ipfs-link";
import { VaultTicker } from "@/components/layout/vault-ticker";
import { HoverVideoCard } from "@/components/nft/hover-video-card";
import { WingProvider } from "@/components/providers/wing-provider";
import { AccountSheet } from "@/components/wallet/account-sheet";
import { server } from "../../setup/msw/server";

const { toast, connection, disconnectMutate } = vi.hoisted(() => {
  const connection: { address: string | undefined; connector: { name: string } } = {
    address: "0x1234567890abcdef1234567890abcdef12345678",
    connector: { name: "MetaMask" }
  };
  return { toast: { success: vi.fn(), error: vi.fn() }, connection, disconnectMutate: vi.fn() };
});
vi.mock("sonner", () => ({ toast }));
vi.mock("wagmi", () => ({
  useConnection: () => connection,
  useDisconnect: () => ({ mutate: disconnectMutate })
}));

beforeEach(() => {
  vi.clearAllMocks();
  Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
});

describe("IpfsLink", () => {
  it("shortens the CID, links to the gateway, and copies the URI", async () => {
    render(
      <IpfsLink uri="ipfs://QmP7Z8VbQLpytzXnceeAAc4D5tX39XVzoEeUZwEK8aPk8W" gatewayUrl="https://ipfs.io/ipfs/QmP7Z8" />
    );
    expect(screen.getByRole("link", { name: /ipfs:\/\/QmP7Z8…Pk8W/ })).toHaveAttribute(
      "href",
      "https://ipfs.io/ipfs/QmP7Z8"
    );
    await userEvent.click(screen.getByRole("button", { name: /copy ipfs uri/i }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("ipfs://QmP7Z8VbQLpytzXnceeAAc4D5tX39XVzoEeUZwEK8aPk8W");
    expect(toast.success).toHaveBeenCalledWith("IPFS URI copied");
  });
});

describe("CodeArtifactCard", () => {
  it("shows the file, copies it, and offers a data-URL download", async () => {
    render(<CodeArtifactCard title="Generator" description="The code." content="print('hi')" fileName="gen.py" />);
    expect(screen.getByText("print('hi')")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /download/i })).toHaveAttribute("download", "gen.py");
    expect(screen.getByRole("link", { name: /download/i })).toHaveAttribute(
      "href",
      expect.stringMatching(/^data:text\/plain/)
    );
    await userEvent.click(screen.getByRole("button", { name: /copy/i }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("print('hi')");
    expect(toast.success).toHaveBeenCalledWith("gen.py copied");
  });
});

describe("VaultTicker", () => {
  it("renders the brass chip with the prize and a ticking clock once the vault loads", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    server.use(
      http.get("/api/vault", () =>
        HttpResponse.json({
          prizeEth: 40.68,
          secondsUntilWithdrawal: 3_661,
          readAtMs: Date.now(),
          mintedCount: 1,
          numWithdrawals: 0
        })
      )
    );
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <VaultTicker />
      </QueryClientProvider>
    );

    const chip = await screen.findByTestId("vault-ticker");
    expect(chip).toHaveTextContent("40.68 ETH");
    expect(chip).toHaveTextContent("01:01:01");
    expect(chip).toHaveAttribute("href", "/vault");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2_000);
    });
    expect(chip).toHaveTextContent("01:00:59");
    vi.useRealTimers();
  });

  it("shows 'open now' once the clock has run out", async () => {
    server.use(
      http.get("/api/vault", () =>
        HttpResponse.json({
          prizeEth: 1,
          secondsUntilWithdrawal: 0,
          readAtMs: Date.now(),
          mintedCount: 1,
          numWithdrawals: 0
        })
      )
    );
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <VaultTicker />
      </QueryClientProvider>
    );
    await waitFor(() => expect(screen.getByTestId("vault-ticker")).toHaveTextContent(/open now/i));
  });
});

describe("HoverVideoCard", () => {
  it("shows the wing's thumbnail and only loads the film on hover", async () => {
    const { container } = render(
      <WingProvider initialWing="light">
        <HoverVideoCard id={3} sublabel="Beauty rank #1" />
      </WingProvider>
    );
    expect(screen.getByRole("img")).toHaveAttribute("src", expect.stringContaining("000003_white_thumb.jpg"));
    expect(screen.getByText("Beauty rank #1")).toBeInTheDocument();
    expect(container.querySelector("video")).not.toBeInTheDocument();

    await userEvent.hover(screen.getByRole("link"));
    expect(container.querySelector("video source")).toHaveAttribute(
      "src",
      expect.stringContaining("000003_white_single.mp4")
    );
    await userEvent.unhover(screen.getByRole("link"));
    expect(container.querySelector("video")).not.toBeInTheDocument();
  });
});

describe("AccountSheet", () => {
  it("lists the address and actions, copies, and disconnects", async () => {
    const onOpenChange = vi.fn();
    render(<AccountSheet open onOpenChange={onOpenChange} />);

    expect(screen.getByTestId("account-sheet")).toHaveTextContent("0x1234567890abcdef1234567890abcdef12345678");
    expect(screen.getByText(/via MetaMask/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /copy address/i }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("0x1234567890abcdef1234567890abcdef12345678");

    await userEvent.click(screen.getByRole("button", { name: /disconnect/i }));
    expect(disconnectMutate).toHaveBeenCalled();
  });

  it("renders nothing without an address", () => {
    connection.address = undefined;
    const { container } = render(<AccountSheet open onOpenChange={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
    connection.address = "0x1234567890abcdef1234567890abcdef12345678";
  });
});
