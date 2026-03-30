import { NextResponse } from "next/server";

import { getConfig } from "@/lib/config";

function joinAssetUrl(base: string, fileName: string) {
  return `${base.replace(/\/+$/, "")}/${fileName.replace(/^\/+/, "")}`;
}

/** Matches on-disk RandomWalk filenames under ASSET_BASE_URL (e.g. randomwalk/000001_black.png). */
function isAllowedFile(path: string) {
  return /^\d{6}_(black|white)(\.png|_thumb\.jpg|_single\.mp4|_triple\.mp4)$/.test(path);
}

function createImagePlaceholder(fileName: string, includeBody: boolean) {
  const match = fileName.match(/^(\d{6})_(black|white)_(thumb\.jpg|\.png)$/);

  if (!match) {
    return null;
  }

  const [, tokenId, theme] = match;
  const darkTheme = theme === "black";
  const background = darkTheme ? "#0c0f1a" : "#f6f0e5";
  const panel = darkTheme ? "#141a2a" : "#fffaf0";
  const accent = darkTheme ? "#f2c14e" : "#9b4aaf";
  const text = darkTheme ? "#f7f2e8" : "#241913";
  const subtext = darkTheme ? "#aeb7cc" : "#6a5447";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" role="img" aria-label="Generating media placeholder">
      <rect width="1600" height="1000" fill="${background}" />
      <rect x="80" y="80" width="1440" height="840" rx="36" fill="${panel}" />
      <g opacity="0.18" stroke="${accent}" stroke-width="10" fill="none">
        <path d="M160 760c120-160 220-240 320-240s160 120 280 120 170-200 320-200 190 110 280 230" />
        <path d="M160 300c110 0 180 90 280 90s170-160 300-160 180 100 280 100 150-70 260-70" />
      </g>
      <text x="160" y="250" fill="${text}" font-size="64" font-family="monospace">NFT ${tokenId}</text>
      <text x="160" y="360" fill="${accent}" font-size="44" font-family="monospace">Generating media</text>
      <text x="160" y="430" fill="${subtext}" font-size="30" font-family="monospace">This placeholder is temporary while artwork files are processing.</text>
    </svg>
  `.trim();

  return new NextResponse(includeBody ? svg : null, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-store",
      "X-Asset-Status": "placeholder"
    }
  });
}

async function handleAssetRequest(
  method: "GET" | "HEAD",
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const fileName = path.join("/");

  if (!fileName || fileName.includes("..") || !isAllowedFile(fileName)) {
    return NextResponse.json({ error: "Asset path is not allowed." }, { status: 400 });
  }

  const isVideo = fileName.endsWith(".mp4");
  const { ASSET_BASE_URL } = getConfig();
  const url = joinAssetUrl(ASSET_BASE_URL, fileName);

  let upstream: Response;
  try {
    upstream = await fetch(
      url,
      isVideo
        ? { cache: "no-store", method }
        : { next: { revalidate: 3600 }, method }
    );
  } catch {
    return NextResponse.json(
      { error: "Asset server unreachable (check NEXT_PUBLIC_ASSET_BASE_URL and that the host is up)." },
      { status: 502 }
    );
  }

  if (!upstream.ok) {
    const placeholder = createImagePlaceholder(fileName, method === "GET");
    if (placeholder) {
      return placeholder;
    }

    return method === "HEAD"
      ? new NextResponse(null, {
          status: upstream.status,
          headers: {
            "X-Asset-Status": "missing"
          }
        })
      : NextResponse.json({ error: "Asset not found." }, { status: upstream.status });
  }

  const headers = new Headers(upstream.headers);
  headers.set("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  headers.set("X-Asset-Status", "ready");

  return new NextResponse(method === "GET" ? upstream.body : null, {
    status: upstream.status,
    headers
  });
}

export async function GET(
  _: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleAssetRequest("GET", context);
}

export async function HEAD(
  _: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleAssetRequest("HEAD", context);
}
