import "server-only";

/**
 * Best-effort fixed-window rate limiter for the public BFF routes. State is per
 * server instance (enough to blunt accidental loops and casual abuse); deploy a
 * platform WAF rule for hard guarantees.
 */

type Window = { count: number; resetAt: number };

const windows = new Map<string, Window>();
const MAX_TRACKED_KEYS = 10_000;

export type RateLimitPolicy = {
  /** Requests allowed per window. */
  limit: number;
  windowMs: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  /** Seconds until the window resets; useful for `Retry-After`. */
  retryAfterSeconds: number;
};

export function checkRateLimit(key: string, policy: RateLimitPolicy, now: number = Date.now()): RateLimitResult {
  let window = windows.get(key);
  if (!window || window.resetAt <= now) {
    if (windows.size >= MAX_TRACKED_KEYS) {
      pruneExpired(now);
    }
    window = { count: 0, resetAt: now + policy.windowMs };
    windows.set(key, window);
  }

  window.count += 1;
  const allowed = window.count <= policy.limit;
  return {
    allowed,
    remaining: Math.max(0, policy.limit - window.count),
    retryAfterSeconds: Math.max(1, Math.ceil((window.resetAt - now) / 1000))
  };
}

function pruneExpired(now: number) {
  for (const [key, window] of windows) {
    if (window.resetAt <= now) {
      windows.delete(key);
    }
  }
  if (windows.size >= MAX_TRACKED_KEYS) {
    windows.clear();
  }
}

/** Client identity for rate limiting: first `X-Forwarded-For` hop, then `X-Real-IP`, else a shared bucket. */
export function clientKey(request: Request, scope: string): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip")?.trim() || "anonymous";
  return `${scope}:${ip}`;
}

export function rateLimitResponse(result: RateLimitResult): Response {
  return Response.json(
    { error: "Too many requests. Please slow down." },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfterSeconds),
        "Cache-Control": "no-store"
      }
    }
  );
}

/** Test helper. */
export function __resetRateLimits(): void {
  windows.clear();
}
