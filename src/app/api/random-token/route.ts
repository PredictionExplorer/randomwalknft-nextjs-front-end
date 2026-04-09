import { NextResponse } from "next/server";

import { getAppConfig } from "@/lib/server/app-config";
import { nftAbi } from "@/generated/wagmi";
import { publicClient } from "@/lib/web3/public-client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { NFT_ADDRESS } = await getAppConfig();
  const { searchParams } = new URL(request.url);
  const excludeParam = searchParams.get("exclude");
  const exclude = excludeParam ? Number(excludeParam) : undefined;

  const totalSupply = Number(
    (await publicClient.readContract({
      address: NFT_ADDRESS,
      abi: nftAbi,
      functionName: "totalSupply"
    })) as bigint
  );

  if (totalSupply <= 0) {
    return NextResponse.json({ tokenId: 0, totalSupply: 0 });
  }

  let tokenId = Math.floor(Math.random() * totalSupply);

  if (exclude !== undefined && totalSupply > 1 && tokenId === exclude) {
    tokenId = (tokenId + 1) % totalSupply;
  }

  return NextResponse.json({ tokenId, totalSupply });
}
