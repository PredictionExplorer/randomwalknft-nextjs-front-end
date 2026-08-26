import { NextResponse } from "next/server";

import { getVaultState } from "@/lib/api/public";

export const dynamic = "force-dynamic";

/** Live Vault game state for the header ticker and vault page refreshes. */
export async function GET() {
  const vault = await getVaultState();
  if (!vault) {
    return NextResponse.json({ error: "vault_unavailable" }, { status: 503 });
  }

  return NextResponse.json(vault, {
    headers: {
      "Cache-Control": "public, max-age=15, s-maxage=30, stale-while-revalidate=120"
    }
  });
}
