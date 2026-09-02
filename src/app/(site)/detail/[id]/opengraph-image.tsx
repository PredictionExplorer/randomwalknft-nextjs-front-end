import { ImageResponse } from "next/og";

import { getTokenInfo } from "@/lib/api/public";
import { createAssetUrls, formatId } from "@/lib/utils";

export const size = {
  width: 1200,
  height: 630
};

export const contentType = "image/png";

/** The artwork never changes and names change rarely; cache cards for a day. */
export const revalidate = 86_400;

/**
 * Composed share card per token: the artwork beside a museum label, instead of
 * a raw small thumbnail. The thumb is inlined as a data URL so a slow asset
 * host degrades to a text-only card rather than a broken image.
 */
export default async function TokenOpenGraphImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tokenId = Number(id);
  const validToken = Number.isInteger(tokenId) && tokenId >= 0;

  let artworkDataUrl: string | null = null;
  let tokenName = "";
  if (validToken) {
    try {
      const response = await fetch(createAssetUrls(tokenId).blackThumb, {
        signal: AbortSignal.timeout(4_000)
      });
      if (response.ok) {
        const buffer = Buffer.from(await response.arrayBuffer());
        artworkDataUrl = `data:image/jpeg;base64,${buffer.toString("base64")}`;
      }
    } catch {
      artworkDataUrl = null;
    }
    try {
      const info = await getTokenInfo(tokenId);
      tokenName = info.TokenInfo.CurName;
    } catch {
      tokenName = "";
    }
  }

  const displayId = validToken ? formatId(tokenId) : "Random Walk NFT";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "linear-gradient(180deg, #09090b, #050505)",
        color: "white"
      }}
    >
      {artworkDataUrl ? (
        <img
          src={artworkDataUrl}
          alt=""
          width={710}
          height={630}
          style={{ width: 710, height: 630, objectFit: "cover" }}
        />
      ) : null}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 48px",
          background: "radial-gradient(circle at top right, rgba(198,118,215,0.28), transparent 55%)"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 22, color: "#c676d7", letterSpacing: "0.3em" }}>RANDOM WALK NFT</div>
          <div style={{ fontSize: 64, fontWeight: 700, marginTop: 20 }}>{displayId}</div>
          {tokenName ? <div style={{ fontSize: 32, color: "#f4bfff", marginTop: 12 }}>“{tokenName}”</div> : null}
          <div style={{ fontSize: 24, color: "#b3a6bb", marginTop: 24, lineHeight: 1.5 }}>
            A one-of-a-kind generative artwork drawn from an on-chain seed. One still, two films. CC0 public domain.
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 20, color: "#9b8ba3", letterSpacing: "0.2em" }}>MINTED ON ARBITRUM</div>
          <div style={{ fontSize: 24, color: "#e8c9f2", marginTop: 8 }}>randomwalknft.com</div>
        </div>
      </div>
    </div>,
    size
  );
}
