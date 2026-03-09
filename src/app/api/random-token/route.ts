import { NextResponse } from "next/server";

import { getRandomTokenIds } from "@/lib/api/public";

export async function GET() {
  const tokenIds = await getRandomTokenIds();
  return NextResponse.json({ tokenIds });
}
