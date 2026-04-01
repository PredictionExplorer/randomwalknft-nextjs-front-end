// @vitest-environment node

import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import { fetchApi, fetchRwalk, postApi } from "@/lib/api/client";
import { getBaseConfig } from "@/lib/config";
import { server } from "../../setup/msw/server";

const { API_BASE_URL, RWALK_BASE_URL } = getBaseConfig();

const validSchema = z.object({ id: z.number(), name: z.string() });

describe("fetchApi", () => {
  it("returns JSON on success", async () => {
    server.use(
      http.get(`${API_BASE_URL}/tokens`, () =>
        HttpResponse.json({ id: 1, name: "Token One" })
      )
    );

    const result = await fetchApi<{ id: number; name: string }>("tokens");

    expect(result).toEqual({ id: 1, name: "Token One" });
  });

  it("throws on non-OK response", async () => {
    server.use(
      http.get(`${API_BASE_URL}/error`, () =>
        HttpResponse.json({ error: "Not found" }, { status: 404 })
      )
    );

    await expect(fetchApi("error")).rejects.toThrow(
      "Upstream request failed: 404 Not Found"
    );
  });

  it("validates with Zod schema when provided", async () => {
    server.use(
      http.get(`${API_BASE_URL}/valid`, () =>
        HttpResponse.json({ id: 42, name: "Valid" })
      )
    );

    const result = await fetchApi("valid", {}, validSchema);

    expect(result).toEqual({ id: 42, name: "Valid" });
  });

  it("throws ZodError on schema mismatch", async () => {
    server.use(
      http.get(`${API_BASE_URL}/invalid`, () =>
        HttpResponse.json({ id: "not-a-number", name: "Test" })
      )
    );

    await expect(fetchApi("invalid", {}, validSchema)).rejects.toThrow(z.ZodError);
  });

  it("strips leading slashes from path", async () => {
    server.use(
      http.get(`${API_BASE_URL}/tokens`, () =>
        HttpResponse.json({ id: 1 })
      )
    );

    const result = await fetchApi<{ id: number }>("/tokens");

    expect(result).toEqual({ id: 1 });
  });
});

describe("fetchRwalk", () => {
  it("calls the RWALK base URL", async () => {
    server.use(
      http.get(`${RWALK_BASE_URL}/status`, () =>
        HttpResponse.json({ status: "ok" })
      )
    );

    const result = await fetchRwalk<{ status: string }>("status");

    expect(result).toEqual({ status: "ok" });
  });
});

describe("postApi", () => {
  it("sends POST with JSON body", async () => {
    let capturedBody = "";
    const capturedHeaderMap: Record<string, string> = {};

    server.use(
      http.post(`${API_BASE_URL}/submit`, async ({ request }) => {
        capturedBody = await request.text();
        capturedHeaderMap["content-type"] = request.headers.get("Content-Type") ?? "";
        capturedHeaderMap["accept"] = request.headers.get("Accept") ?? "";
        return HttpResponse.json({ success: true });
      })
    );

    const body = JSON.stringify({ foo: "bar" });
    const result = await postApi<{ success: boolean }>("submit", body);

    expect(result).toEqual({ success: true });
    expect(capturedBody).toBe(body);
    expect(capturedHeaderMap["content-type"]).toBe("application/json");
    expect(capturedHeaderMap["accept"]).toBe("application/json");
  });

  it("does not set Content-Type for FormData body", async () => {
    const capturedHeaderMap: Record<string, string | null> = {};
    server.use(
      http.post(`${API_BASE_URL}/upload`, async ({ request }) => {
        capturedHeaderMap["content-type"] = request.headers.get("Content-Type");
        return HttpResponse.json({ uploaded: true });
      })
    );
    const formData = new FormData();
    formData.append("file", "data");
    const result = await postApi<{ uploaded: boolean }>("upload", formData);
    expect(result).toEqual({ uploaded: true });
    // FormData should NOT have explicit Content-Type (browser sets multipart boundary)
    expect(capturedHeaderMap["content-type"]).not.toBe("application/json");
  });
});
