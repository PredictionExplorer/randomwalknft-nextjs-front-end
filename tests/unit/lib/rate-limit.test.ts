// @vitest-environment node

import { beforeEach, describe, expect, it } from "vitest";

import { __resetRateLimits, checkRateLimit, clientKey, rateLimitResponse } from "@/lib/server/rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    __resetRateLimits();
  });

  it("allows up to the limit inside a window and blocks afterwards", () => {
    const policy = { limit: 3, windowMs: 60_000 };
    const now = 1_000_000;

    expect(checkRateLimit("k", policy, now)).toMatchObject({ allowed: true, remaining: 2 });
    expect(checkRateLimit("k", policy, now + 1)).toMatchObject({ allowed: true, remaining: 1 });
    expect(checkRateLimit("k", policy, now + 2)).toMatchObject({ allowed: true, remaining: 0 });
    const blocked = checkRateLimit("k", policy, now + 3);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBe(60);
  });

  it("opens a fresh window once the previous one expires", () => {
    const policy = { limit: 1, windowMs: 1_000 };

    expect(checkRateLimit("k", policy, 0).allowed).toBe(true);
    expect(checkRateLimit("k", policy, 500).allowed).toBe(false);
    expect(checkRateLimit("k", policy, 1_000).allowed).toBe(true);
  });

  it("tracks keys independently", () => {
    const policy = { limit: 1, windowMs: 1_000 };

    expect(checkRateLimit("a", policy, 0).allowed).toBe(true);
    expect(checkRateLimit("b", policy, 0).allowed).toBe(true);
    expect(checkRateLimit("a", policy, 1).allowed).toBe(false);
  });
});

describe("clientKey", () => {
  it("prefers the first forwarded hop, then X-Real-IP, then a shared bucket", () => {
    const forwarded = new Request("http://x", { headers: { "x-forwarded-for": "198.51.100.7, 10.0.0.1" } });
    expect(clientKey(forwarded, "scope")).toBe("scope:198.51.100.7");

    const real = new Request("http://x", { headers: { "x-real-ip": "198.51.100.8" } });
    expect(clientKey(real, "scope")).toBe("scope:198.51.100.8");

    expect(clientKey(new Request("http://x"), "scope")).toBe("scope:anonymous");
  });
});

describe("rateLimitResponse", () => {
  it("returns 429 with Retry-After", async () => {
    const response = rateLimitResponse({ allowed: false, remaining: 0, retryAfterSeconds: 42 });

    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("42");
    await expect(response.json()).resolves.toEqual({ error: "Too many requests. Please slow down." });
  });
});
