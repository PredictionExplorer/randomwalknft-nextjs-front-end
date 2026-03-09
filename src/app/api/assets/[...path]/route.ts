import { NextResponse } from "next/server";

import { ASSET_BASE_URL, SUPPORTED_ASSET_EXTENSIONS } from "@/lib/config";

function isAllowedFile(path: string) {
  return (
    /^\d{6}_(black|white)_(thumb\.jpg|single\.mp4|triple\.mp4|\.png)$/.test(path) ||
    SUPPORTED_ASSET_EXTENSIONS.some((extension) => path.endsWith(extension))
  );
}

export async function GET(
  _: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const fileName = path.join("/");

  if (!fileName || fileName.includes("..") || !isAllowedFile(fileName)) {
    return NextResponse.json({ error: "Asset path is not allowed." }, { status: 400 });
  }

  const isVideo = fileName.endsWith(".mp4");
  const upstream = await fetch(`${ASSET_BASE_URL}/${fileName}`, isVideo ? { cache: "no-store" } : { next: { revalidate: 3600 } });

  if (!upstream.ok) {
    return NextResponse.json({ error: "Asset not found." }, { status: upstream.status });
  }

  const headers = new Headers(upstream.headers);
  headers.set("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers
  });
}
