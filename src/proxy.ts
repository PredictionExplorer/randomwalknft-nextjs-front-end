import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** API routes that set their own CDN-friendly `Cache-Control`; everything else under /api is uncacheable. */
const SELF_CACHED_API_PREFIXES = ["/api/vault", "/api/assets/"];

export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const headers = response.headers;
  const { pathname } = request.nextUrl;

  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  if (pathname.startsWith("/api/") && !SELF_CACHED_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    headers.set("Cache-Control", "no-store");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"]
};
