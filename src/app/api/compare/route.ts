import { NextResponse } from "next/server";

import { getRandomPair, getVoteCount, submitBeautyVote } from "@/lib/api/public";

export async function GET() {
  const [tokenIds, totalCount] = await Promise.all([getRandomPair(), getVoteCount()]);
  return NextResponse.json({
    tokenIds,
    totalCount
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    firstId?: number;
    secondId?: number;
    winner?: number;
  };

  if (!body.firstId || !body.secondId || !body.winner) {
    return NextResponse.json({ error: "Invalid vote payload." }, { status: 400 });
  }

  const response = await submitBeautyVote(body.firstId, body.secondId, body.winner);
  return NextResponse.json(response);
}
