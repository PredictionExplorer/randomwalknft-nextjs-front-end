// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/assets/[...path]/route";

describe("assets route", () => {
  it("rejects disallowed paths", async () => {
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ path: ["..", "secrets.txt"] })
    });

    expect(response.status).toBe(400);
  });

  it("proxies allowed image assets with caching headers", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response("ok", {
          status: 200,
          headers: {
            "content-type": "image/jpeg"
          }
        })
      );

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ path: ["000001_black_thumb.jpg"] })
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("000001_black_thumb.jpg"),
      expect.objectContaining({ next: { revalidate: 3600 } })
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toContain("s-maxage=3600");

    fetchMock.mockRestore();
  });

  it("uses no-store for video assets", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("video", { status: 200 }));

    await GET(new Request("http://localhost"), {
      params: Promise.resolve({ path: ["000001_black_single.mp4"] })
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("000001_black_single.mp4"),
      expect.objectContaining({ cache: "no-store" })
    );

    fetchMock.mockRestore();
  });

  it("allows files matching supported extensions", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("ok", { status: 200, headers: { "content-type": "image/png" } })
    );
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ path: ["custom_name.png"] })
    });
    expect(response.status).toBe(200);
    fetchMock.mockRestore();
  });

  it("returns upstream error status when asset is not found", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 404 })
    );
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ path: ["000001_black_thumb.jpg"] })
    });
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toBe("Asset not found.");
    fetchMock.mockRestore();
  });
});
