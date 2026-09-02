import { NextResponse, connection } from "next/server";

import { getVaultState } from "@/lib/api/public";

/** Live Vault game state for the header ticker and vault page refreshes. */
export async function GET() {
  // Always request-time: the response must reflect the latest cached read, never a build-time one.
  await connection();
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
