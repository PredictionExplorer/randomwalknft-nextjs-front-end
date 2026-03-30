// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

import { GET, HEAD } from "@/app/api/assets/[...path]/route";

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
    expect(response.headers.get("x-asset-status")).toBe("ready");
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

  it("rejects filenames outside the RandomWalk asset pattern", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ path: ["custom_name.png"] })
    });
    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
    fetchMock.mockRestore();
  });

  it("returns a placeholder image when a generated image asset is not found", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 404 })
    );
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ path: ["000001_black_thumb.jpg"] })
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("image/svg+xml");
    expect(response.headers.get("x-asset-status")).toBe("placeholder");
    const body = await response.text();
    expect(body).toContain("Generating media");
    expect(body).toContain("NFT 000001");
    fetchMock.mockRestore();
  });

  it("returns upstream error status when a missing video asset is requested", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 404 })
    );
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ path: ["000001_black_single.mp4"] })
    });
    expect(response.status).toBe(404);
    expect(response.headers.get("x-asset-status")).toBeNull();
    const body = await response.json();
    expect(body.error).toBe("Asset not found.");
    fetchMock.mockRestore();
  });

  it("supports HEAD requests for probing asset availability", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 404 })
    );

    const response = await HEAD(new Request("http://localhost", { method: "HEAD" }), {
      params: Promise.resolve({ path: ["000001_black_thumb.jpg"] })
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("x-asset-status")).toBe("placeholder");
    expect(await response.text()).toBe("");

    fetchMock.mockRestore();
  });
});
