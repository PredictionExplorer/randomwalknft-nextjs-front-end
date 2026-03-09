import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";

import { getRandomTokenIds } from "@/lib/api/public";
import { createAssetUrls, formatId } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Random Image"
};

export default async function RandomImagePage() {
  const [tokenId] = await getRandomTokenIds();
  const assets = createAssetUrls(tokenId ?? 1);

  return (
    <div
      className="relative min-h-[calc(100vh-12rem)]"
      style={{
        backgroundImage: `url(${assets.blackImage})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain"
      }}
    >
      <div className="absolute inset-x-0 bottom-10 flex justify-center">
        <Link href={`/detail/${tokenId ?? 1}` as Route} className="rounded-full border border-border bg-background/70 px-5 py-3 text-sm tracking-[0.2em] text-secondary backdrop-blur">
          {formatId(tokenId ?? 1)}
        </Link>
      </div>
    </div>
  );
}
