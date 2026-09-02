import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Provenance } from "@/components/detail/provenance";
import type { Nft } from "@/lib/types";
import { createAssetUrls } from "@/lib/utils";

const CONTRACT = "0x895a6F444BE4ba9d124F61DF736605792B35D66b";

function buildNft(overrides: Partial<Nft> = {}): Nft {
  return {
    id: 42,
    name: "",
    seed: "ab".repeat(32),
    owner: "0x1111111111111111111111111111111111111111",
    mintedAt: "2021-11-12T01:52:00.000Z",
    assets: createAssetUrls(42),
    tokenHistory: [
      { recordType: 1, timestamp: 1_636_681_920, owner: "0x2222222222222222222222222222222222222222", price: 0.0069 },
      {
        recordType: 2,
        timestamp: 1_640_000_000,
        seller: "0x2222222222222222222222222222222222222222",
        buyer: "0x1111111111111111111111111111111111111111",
        price: 0.5
      }
    ],
    ...overrides
  } as Nft;
}

describe("Provenance", () => {
  it("lists owner, rank, seed, explorer links, and a chronological history", () => {
    render(<Provenance nft={buildNft()} contractAddress={CONTRACT} beautyRank={17} rankedCount={4097} />);

    expect(screen.getAllByRole("link", { name: "0x111111...111111" })[0]).toHaveAttribute(
      "href",
      "/gallery?address=0x1111111111111111111111111111111111111111"
    );
    expect(screen.getByText("#17")).toBeInTheDocument();
    expect(screen.getByText(/of 4,097/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /redraw in the atelier/i })).toHaveAttribute(
      "href",
      `/atelier?seed=${"ab".repeat(32)}`
    );
    expect(screen.getByRole("link", { name: /#42 on arbiscan/i })).toHaveAttribute(
      "href",
      expect.stringContaining(`/token/${CONTRACT}?a=42`)
    );

    const timeline = within(screen.getByTestId("history-timeline"));
    const items = timeline.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent(/Minted/);
    expect(items[0]).toHaveTextContent(/0.0069 ETH/);
    expect(items[1]).toHaveTextContent(/Sold/);
    expect(items[1]).toHaveTextContent(/0.5000 ETH/);
  });

  it("explains missing rank and history for a token still syncing", () => {
    render(
      <Provenance
        nft={buildNft({ isPendingMetadata: true, tokenHistory: [] })}
        contractAddress={CONTRACT}
        beautyRank={undefined}
        rankedCount={0}
      />
    );
    expect(screen.getByText(/not yet ranked/i)).toBeInTheDocument();
    expect(screen.getByText(/history is still syncing/i)).toBeInTheDocument();
  });
});
