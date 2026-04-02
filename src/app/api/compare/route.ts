import { NextResponse } from "next/server";
import { z } from "zod";

import { actionResponseSchema } from "@/lib/api/schemas";
import { fetchBeautyComparePairIds, fetchRankingSignChallenge, getVoteCount } from "@/lib/api/public";
import { getBaseConfig } from "@/lib/config";

const voteSchema = z.object({
  firstId: z.number().int().nonnegative(),
  secondId: z.number().int().nonnegative(),
  winner: z.number().int().nonnegative(),
  signNonce: z.string().min(1),
  signature: z.string().regex(/^0x[0-9a-fA-F]+$/),
  chainId: z.number().int().positive()
});

export async function GET(request: Request) {
  const sp = new URL(request.url).searchParams;
  const voter = sp.get("voter")?.trim() || undefined;
  const skipPairFilter = sp.get("skip_pair_filter") === "1";
  const [beauty, totalCount, challenge] = await Promise.all([
    fetchBeautyComparePairIds(voter, { skipPairFilter }),
    getVoteCount(),
    fetchRankingSignChallenge()
  ]);
  return NextResponse.json({
    tokenIds: beauty.token_ids,
    totalCount,
    signNonce: challenge.nonce,
    pairExhausted: beauty.pair_exhausted
  });
}

export async function POST(request: Request) {
  const raw: unknown = await request.json();
  const result = voteSchema.safeParse(raw);

  if (!result.success) {
    return NextResponse.json({ error: "Invalid vote payload." }, { status: 400 });
  }

  const { firstId, secondId, winner, signNonce, signature, chainId } = result.data;
  const { API_BASE_URL } = getBaseConfig();

  const upstream = await fetch(`${API_BASE_URL}/add_game`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      nft1: firstId,
      nft2: secondId,
      nft1_win: winner === firstId ? 1 : 0,
      sign_nonce: signNonce,
      signature,
      chain_id: chainId
    }),
    cache: "no-store"
  });

  let data: unknown;
  try {
    data = await upstream.json();
  } catch {
    data = { error: "Invalid upstream response." };
  }

  if (!upstream.ok) {
    return NextResponse.json(data && typeof data === "object" ? data : { error: "Vote failed." }, {
      status: upstream.status
    });
  }

  return NextResponse.json(actionResponseSchema.parse(data));
}
