import { NextResponse } from "next/server";
import { z } from "zod";

import { getRandomPair, getVoteCount, submitBeautyVote } from "@/lib/api/public";

const voteSchema = z.object({
  firstId: z.number().int().nonnegative(),
  secondId: z.number().int().nonnegative(),
  winner: z.number().int().nonnegative()
});

export async function GET() {
  const [tokenIds, totalCount] = await Promise.all([getRandomPair(), getVoteCount()]);
  return NextResponse.json({
    tokenIds,
    totalCount
  });
}

export async function POST(request: Request) {
  const raw: unknown = await request.json();
  const result = voteSchema.safeParse(raw);

  if (!result.success) {
    return NextResponse.json({ error: "Invalid vote payload." }, { status: 400 });
  }

  const { firstId, secondId, winner } = result.data;
  const response = await submitBeautyVote(firstId, secondId, winner);
  return NextResponse.json(response);
}
