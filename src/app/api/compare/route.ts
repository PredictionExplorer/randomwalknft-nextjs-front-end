import { NextResponse } from "next/server";
import { isAddress } from "viem";
import { z } from "zod";

import { UpstreamHttpError } from "@/lib/api/client";
import { isFetchConnectionError } from "@/lib/api/backend-errors";
import { fetchBeautyComparePairIds, fetchRankingSignChallenge, getVoteCount, submitBeautyVote } from "@/lib/api/public";
import { checkRateLimit, clientKey, rateLimitResponse } from "@/lib/server/rate-limit";

export const dynamic = "force-dynamic";

const voteSchema = z.object({
  firstId: z.number().int().nonnegative(),
  secondId: z.number().int().nonnegative(),
  winner: z.number().int().nonnegative(),
  signNonce: z.string().min(1).max(256),
  signature: z.string().regex(/^0x[0-9a-fA-F]{130}$/),
  chainId: z.number().int().positive()
});

const PAIR_POLICY = { limit: 90, windowMs: 60_000 };
const VOTE_POLICY = { limit: 30, windowMs: 60_000 };
const MAX_VOTE_BODY_BYTES = 4_096;

/** Only a string `error` field from our own backend is forwarded; nothing else leaks through. */
function upstreamErrorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === "object" && "error" in body) {
    const { error } = body as { error?: unknown };
    if (typeof error === "string" && error.trim()) {
      return error.trim().slice(0, 200);
    }
  }
  return fallback;
}

export async function GET(request: Request) {
  const limit = checkRateLimit(clientKey(request, "compare:get"), PAIR_POLICY);
  if (!limit.allowed) {
    return rateLimitResponse(limit);
  }

  const sp = new URL(request.url).searchParams;
  const rawVoter = sp.get("voter")?.trim();
  if (rawVoter && !isAddress(rawVoter)) {
    return NextResponse.json({ error: "Invalid voter address." }, { status: 400 });
  }
  const skipPairFilter = sp.get("skip_pair_filter") === "1";

  try {
    const [beauty, totalCount, challenge] = await Promise.all([
      fetchBeautyComparePairIds(rawVoter || undefined, { skipPairFilter }),
      getVoteCount(),
      fetchRankingSignChallenge()
    ]);
    return NextResponse.json({
      tokenIds: beauty.token_ids,
      totalCount,
      signNonce: challenge.nonce,
      pairExhausted: beauty.pair_exhausted
    });
  } catch (error) {
    if (isFetchConnectionError(error) || error instanceof UpstreamHttpError) {
      return NextResponse.json({ error: "The ranking service is temporarily unavailable." }, { status: 503 });
    }
    throw error;
  }
}

export async function POST(request: Request) {
  const limit = checkRateLimit(clientKey(request, "compare:post"), VOTE_POLICY);
  if (!limit.allowed) {
    return rateLimitResponse(limit);
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_VOTE_BODY_BYTES) {
    return NextResponse.json({ error: "Vote payload too large." }, { status: 413 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid vote payload." }, { status: 400 });
  }
  const result = voteSchema.safeParse(raw);
  if (!result.success) {
    return NextResponse.json({ error: "Invalid vote payload." }, { status: 400 });
  }

  const { firstId, secondId, winner } = result.data;
  if (firstId === secondId || (winner !== firstId && winner !== secondId)) {
    return NextResponse.json({ error: "Invalid vote payload." }, { status: 400 });
  }

  try {
    const data = await submitBeautyVote({ ...result.data, signature: result.data.signature as `0x${string}` });
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof UpstreamHttpError) {
      // 4xx (e.g. 409 already voted) carries meaning for the client; 5xx becomes a generic 502.
      const status = error.status >= 500 ? 502 : error.status;
      return NextResponse.json({ error: upstreamErrorMessage(error.body, "Vote failed.") }, { status });
    }
    if (isFetchConnectionError(error)) {
      return NextResponse.json({ error: "The ranking service is temporarily unavailable." }, { status: 503 });
    }
    throw error;
  }
}
