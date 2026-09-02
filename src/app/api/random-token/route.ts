import { NextResponse } from "next/server";
import { z } from "zod";

import { nftAbi } from "@/generated/wagmi";
import { getAppConfig } from "@/lib/server/app-config";
import { checkRateLimit, clientKey, rateLimitResponse } from "@/lib/server/rate-limit";
import { getPublicClient } from "@/lib/web3/public-client";

const excludeSchema = z.coerce.number().int().nonnegative().optional();
const POLICY = { limit: 120, windowMs: 60_000 };

export async function GET(request: Request) {
  const limit = checkRateLimit(clientKey(request, "random-token"), POLICY);
  if (!limit.allowed) {
    return rateLimitResponse(limit);
  }

  const { searchParams } = new URL(request.url);
  const parsedExclude = excludeSchema.safeParse(searchParams.get("exclude") ?? undefined);
  const exclude = parsedExclude.success ? parsedExclude.data : undefined;

  let totalSupply: number;
  try {
    const { NFT_ADDRESS } = await getAppConfig();
    totalSupply = Number(
      await getPublicClient().readContract({
        address: NFT_ADDRESS,
        abi: nftAbi,
        functionName: "totalSupply"
      })
    );
  } catch {
    return NextResponse.json({ error: "Supply is temporarily unavailable." }, { status: 503 });
  }

  if (totalSupply <= 0) {
    return NextResponse.json({ tokenId: 0, totalSupply: 0 });
  }

  let tokenId = Math.floor(Math.random() * totalSupply);

  if (exclude !== undefined && totalSupply > 1 && tokenId === exclude) {
    tokenId = (tokenId + 1) % totalSupply;
  }

  return NextResponse.json({ tokenId, totalSupply });
}
