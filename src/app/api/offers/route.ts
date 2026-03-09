import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getOffers } from "@/lib/api/public";

export async function GET(request: NextRequest) {
  const account = request.nextUrl.searchParams.get("account")?.toLowerCase();
  const [buyOffers, sellOffers] = await Promise.all([getOffers("buy"), getOffers("sell")]);

  if (!account) {
    return NextResponse.json({ buyOffers, sellOffers });
  }

  return NextResponse.json({
    buyOffers: buyOffers.filter((offer) => offer.buyer.toLowerCase() === account),
    sellOffers: sellOffers.filter((offer) => offer.seller.toLowerCase() === account)
  });
}
