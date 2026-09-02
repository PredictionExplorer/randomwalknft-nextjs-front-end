// @vitest-environment node

import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { server } from "../../setup/msw/server";

const PEERS = ["https://a1.test.example.com", "https://a2.test.example.com", "https://a3.test.example.com"];

describe("fetchApi failover across the rotation", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_API_URLS", PEERS.join(","));
    // Pin the clock so the hourly slot picks a1 first: floor(now / 1h) % 3 === 0.
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(3 * 60 * 60 * 1000));
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(async () => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    const rotation = await import("@/lib/server-rotation");
    rotation.__resetServerRotation();
  });

  it("walks every peer after connection failures and 5xx answers before giving up", async () => {
    const hits: string[] = [];
    server.use(
      http.get(`${PEERS[0]}/status`, () => {
        hits.push("a1");
        return HttpResponse.error();
      }),
      http.get(`${PEERS[1]}/status`, () => {
        hits.push("a2");
        return HttpResponse.json({ error: "boom" }, { status: 503 });
      }),
      http.get(`${PEERS[2]}/status`, () => {
        hits.push("a3");
        return HttpResponse.json({ status: "ok" });
      })
    );
    const { __resetServerRotation } = await import("@/lib/server-rotation");
    __resetServerRotation();
    const { fetchApi } = await import("@/lib/api/client");

    await expect(fetchApi<{ status: string }>("status")).resolves.toEqual({ status: "ok" });
    expect(hits).toEqual(["a1", "a2", "a3"]);
  });

  it("surfaces the last 5xx as an UpstreamHttpError when every peer fails", async () => {
    for (const peer of PEERS) {
      server.use(http.get(`${peer}/status`, () => HttpResponse.json({ error: "down" }, { status: 502 })));
    }
    const { __resetServerRotation } = await import("@/lib/server-rotation");
    __resetServerRotation();
    const { fetchApi, UpstreamHttpError } = await import("@/lib/api/client");

    const error = await fetchApi("status").catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(UpstreamHttpError);
    expect((error as InstanceType<typeof UpstreamHttpError>).status).toBe(502);
    expect((error as InstanceType<typeof UpstreamHttpError>).body).toEqual({ error: "down" });
  });

  it("reports a stable backend-unavailable message when no peer accepts a connection", async () => {
    for (const peer of PEERS) {
      server.use(http.get(`${peer}/status`, () => HttpResponse.error()));
    }
    const { __resetServerRotation } = await import("@/lib/server-rotation");
    __resetServerRotation();
    const { fetchApi } = await import("@/lib/api/client");

    await expect(fetchApi("status")).rejects.toThrow(/backend API is unreachable/);
  });

  it("never replays a POST on another peer after a 5xx", async () => {
    const hits: string[] = [];
    server.use(
      http.post(`${PEERS[0]}/submit`, () => {
        hits.push("a1");
        return HttpResponse.json({ error: "half done" }, { status: 500 });
      }),
      http.post(`${PEERS[1]}/submit`, () => {
        hits.push("a2");
        return HttpResponse.json({ ok: true });
      })
    );
    const { __resetServerRotation } = await import("@/lib/server-rotation");
    __resetServerRotation();
    const { postApi } = await import("@/lib/api/client");

    await expect(postApi("submit", "{}")).rejects.toThrow(/500/);
    expect(hits).toEqual(["a1"]);
  });
});

describe("upstream timeouts", () => {
  it("is treated as a retryable connection error", async () => {
    const { isFetchConnectionError, isUpstreamTimeoutError } = await import("@/lib/api/backend-errors");
    const timeout = new DOMException("The operation was aborted due to timeout", "TimeoutError");

    expect(isUpstreamTimeoutError(timeout)).toBe(true);
    expect(isFetchConnectionError(timeout)).toBe(true);
    expect(isFetchConnectionError(new Error("plain"))).toBe(false);
  });
});
