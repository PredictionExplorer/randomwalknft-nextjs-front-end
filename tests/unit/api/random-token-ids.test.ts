// @vitest-environment node

import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { server } from "../../setup/msw/server";

const API_BASE_URL = "https://api.test.example.com";

describe("random token id API helpers", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("fetches the explore pool and normalizes token IDs", async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${API_BASE_URL}/api/randomwalk/explore/random`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json([7, "8", -1, "not-a-token", "", null, 2.5, "Infinity", 0]);
      })
    );

    const { getRandomTokenIds } = await import("@/lib/api/public");

    await expect(getRandomTokenIds()).resolves.toEqual([7, 8, 0]);
    expect(new URL(capturedUrl!).searchParams.get("limit")).toBe("12");
  });

  it("treats a backend null pool as empty", async () => {
    server.use(
      http.get(`${API_BASE_URL}/api/randomwalk/explore/random`, () => HttpResponse.json(null))
    );

    const { getRandomTokenIds } = await import("@/lib/api/public");

    await expect(getRandomTokenIds()).resolves.toEqual([]);
  });

  it("applies the same normalization when bypassing the data cache", async () => {
    server.use(
      http.get(`${API_BASE_URL}/api/randomwalk/explore/random`, () =>
        HttpResponse.json(["3", 4, -2, "bad"])
      )
    );

    const { getRandomTokenIdsFresh } = await import("@/lib/api/public");

    await expect(getRandomTokenIdsFresh()).resolves.toEqual([3, 4]);
  });
});
