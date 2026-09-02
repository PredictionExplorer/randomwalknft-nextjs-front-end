import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from "vitest";

import {
  FAILURE_COOLDOWN_MS,
  ROTATION_PERIOD_MS,
  __resetServerRotation,
  markServerDown,
  parseUrlList,
  pickServer,
  rebaseUrl
} from "@/lib/server-rotation";

const A = "https://a1.example.com";
const B = "https://a2.example.com";
const C = "https://a3.example.com";

/** A timestamp whose hourly slot is 0 for a list of `n` servers. */
const slotStart = (n: number) => {
  const hour = Math.floor(Date.now() / ROTATION_PERIOD_MS);
  return (hour - (hour % n)) * ROTATION_PERIOD_MS;
};

let warnSpy: MockInstance;

beforeEach(() => {
  __resetServerRotation();
  // markServerDown logs intentionally; keep test output clean.
  warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  warnSpy.mockRestore();
});

describe("parseUrlList", () => {
  it("prefers the plural list and trims entries and trailing slashes", () => {
    expect(parseUrlList(` ${A}/ , ${B}`, "https://ignored.example.com")).toEqual([A, B]);
  });

  it("falls back to the singular var as a one-element list", () => {
    expect(parseUrlList(undefined, `${A}/`)).toEqual([A]);
    expect(parseUrlList("", ` ${A} `)).toEqual([A]);
  });

  it("returns [] when nothing is configured", () => {
    expect(parseUrlList(undefined, undefined)).toEqual([]);
    expect(parseUrlList(" , ", "")).toEqual([]);
  });
});

describe("pickServer", () => {
  it("alternates servers by clock hour", () => {
    const t0 = slotStart(2);
    expect(pickServer([A, B], t0)).toBe(A);
    expect(pickServer([A, B], t0 + ROTATION_PERIOD_MS)).toBe(B);
    expect(pickServer([A, B], t0 + 2 * ROTATION_PERIOD_MS)).toBe(A);
  });

  it("is sticky within the hour", () => {
    const t0 = slotStart(2);
    expect(pickServer([A, B], t0 + 1)).toBe(A);
    expect(pickServer([A, B], t0 + ROTATION_PERIOD_MS - 1)).toBe(A);
  });

  it("skips a server that was marked down", () => {
    const t0 = slotStart(2);
    markServerDown(A, t0);
    expect(pickServer([A, B], t0 + 1)).toBe(B);
  });

  it("returns the downed server again after the cooldown", () => {
    const t0 = slotStart(2);
    markServerDown(A, t0);
    expect(pickServer([A, B], t0 + FAILURE_COOLDOWN_MS + 1)).toBe(A);
  });

  it("walks the whole list when several servers are down", () => {
    const t0 = slotStart(3);
    markServerDown(A, t0);
    markServerDown(B, t0);
    expect(pickServer([A, B, C], t0 + 1)).toBe(C);
  });

  it("falls back to the hourly pick (and logs) when all servers are down", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const t0 = slotStart(2);
    markServerDown(A, t0);
    markServerDown(B, t0);
    expect(pickServer([A, B], t0 + 1)).toBe(A);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('returns "" for an empty list', () => {
    expect(pickServer([], Date.now())).toBe("");
  });
});

describe("rebaseUrl", () => {
  it("moves a URL from the failed base onto the current pick", () => {
    const t0 = slotStart(2);
    markServerDown(A, t0);
    expect(rebaseUrl(`${A}/api/randomwalk/statistics`, [A, B], t0 + 1)).toBe(`${B}/api/randomwalk/statistics`);
  });

  it("returns null for URLs outside the configured bases", () => {
    expect(rebaseUrl("https://other.example.com/x", [A, B], Date.now())).toBeNull();
  });

  it("returns null when no alternative server is available", () => {
    const t0 = slotStart(2);
    // Nothing marked down: the pick equals the URL's own base.
    expect(rebaseUrl(`${A}/statistics`, [A], t0)).toBeNull();
  });
});
