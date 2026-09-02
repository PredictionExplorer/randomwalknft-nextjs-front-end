// @vitest-environment node

import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { proxy } from "@/proxy";

function run(path: string) {
  return proxy(new NextRequest(new URL(path, "https://randomwalknft.com")));
}

describe("proxy", () => {
  it("adds the security headers to every response", () => {
    const response = run("/gallery");

    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("x-frame-options")).toBe("DENY");
    expect(response.headers.get("referrer-policy")).toBe("strict-origin-when-cross-origin");
    expect(response.headers.get("permissions-policy")).toContain("camera=()");
    expect(response.headers.get("cache-control")).toBeNull();
  });

  it("marks generic API routes uncacheable", () => {
    expect(run("/api/compare").headers.get("cache-control")).toBe("no-store");
    expect(run("/api/random-token?exclude=1").headers.get("cache-control")).toBe("no-store");
  });

  it("leaves CDN-cached API routes to their own Cache-Control", () => {
    expect(run("/api/vault").headers.get("cache-control")).toBeNull();
    expect(run("/api/assets/000001_black_thumb.jpg").headers.get("cache-control")).toBeNull();
  });
});
