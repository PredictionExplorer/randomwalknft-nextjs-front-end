import { act, renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { useRandomTokenHistory } from "@/lib/use-random-token-history";
import { server } from "../../setup/msw/server";

function mockRandomToken(tokenId: number, totalSupply = 100) {
  server.use(
    http.get("/api/random-token", () =>
      HttpResponse.json({ tokenId, totalSupply })
    )
  );
}

describe("useRandomTokenHistory", () => {
  it("initializes with the provided token ID", () => {
    const { result } = renderHook(() => useRandomTokenHistory(42));
    expect(result.current.currentTokenId).toBe(42);
    expect(result.current.canGoBack).toBe(false);
  });

  it("fetches an initial token when none is provided", async () => {
    mockRandomToken(77);
    const { result } = renderHook(() => useRandomTokenHistory());

    await waitFor(() => {
      expect(result.current.currentTokenId).toBe(77);
    });
  });

  it("canGoBack is false at the start", () => {
    const { result } = renderHook(() => useRandomTokenHistory(1));
    expect(result.current.canGoBack).toBe(false);
  });

  it("goNext fetches a new token and advances the index", async () => {
    mockRandomToken(50);
    const { result } = renderHook(() => useRandomTokenHistory(10));

    await act(async () => {
      await result.current.goNext();
    });

    expect(result.current.currentTokenId).toBe(50);
    expect(result.current.canGoBack).toBe(true);
  });

  it("goBack returns to the previous token", async () => {
    mockRandomToken(50);
    const { result } = renderHook(() => useRandomTokenHistory(10));

    await act(async () => {
      await result.current.goNext();
    });
    expect(result.current.currentTokenId).toBe(50);

    act(() => {
      result.current.goBack();
    });
    expect(result.current.currentTokenId).toBe(10);
    expect(result.current.canGoBack).toBe(false);
  });

  it("goBack does nothing when already at the first item", () => {
    const { result } = renderHook(() => useRandomTokenHistory(10));

    act(() => {
      result.current.goBack();
    });
    expect(result.current.currentTokenId).toBe(10);
    expect(result.current.canGoBack).toBe(false);
  });

  it("navigating back then forward reuses history before fetching new", async () => {
    mockRandomToken(20);
    const { result } = renderHook(() => useRandomTokenHistory(10));

    await act(async () => {
      await result.current.goNext();
    });
    expect(result.current.currentTokenId).toBe(20);

    act(() => {
      result.current.goBack();
    });
    expect(result.current.currentTokenId).toBe(10);

    await act(async () => {
      await result.current.goNext();
    });
    expect(result.current.currentTokenId).toBe(20);
  });

  it("builds a multi-step history", async () => {
    let callCount = 0;
    server.use(
      http.get("/api/random-token", () => {
        callCount += 1;
        return HttpResponse.json({ tokenId: callCount * 10, totalSupply: 100 });
      })
    );

    const { result } = renderHook(() => useRandomTokenHistory(1));

    await act(async () => { await result.current.goNext(); });
    expect(result.current.currentTokenId).toBe(10);

    await act(async () => { await result.current.goNext(); });
    expect(result.current.currentTokenId).toBe(20);

    await act(async () => { await result.current.goNext(); });
    expect(result.current.currentTokenId).toBe(30);

    act(() => { result.current.goBack(); });
    expect(result.current.currentTokenId).toBe(20);

    act(() => { result.current.goBack(); });
    expect(result.current.currentTokenId).toBe(10);

    act(() => { result.current.goBack(); });
    expect(result.current.currentTokenId).toBe(1);

    expect(result.current.canGoBack).toBe(false);
  });

  it("does not advance when the API call fails", async () => {
    server.use(
      http.get("/api/random-token", () => new HttpResponse(null, { status: 500 }))
    );

    const { result } = renderHook(() => useRandomTokenHistory(10));

    await act(async () => {
      await result.current.goNext();
    });

    expect(result.current.currentTokenId).toBe(10);
    expect(result.current.canGoBack).toBe(false);
  });

  it("does not advance when totalSupply is zero", async () => {
    server.use(
      http.get("/api/random-token", () =>
        HttpResponse.json({ tokenId: 0, totalSupply: 0 })
      )
    );

    const { result } = renderHook(() => useRandomTokenHistory(5));

    await act(async () => {
      await result.current.goNext();
    });

    expect(result.current.currentTokenId).toBe(5);
  });

  it("passes exclude parameter to avoid showing the same token", async () => {
    let capturedUrl = "";
    server.use(
      http.get("/api/random-token", ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ tokenId: 99, totalSupply: 100 });
      })
    );

    const { result } = renderHook(() => useRandomTokenHistory(42));

    await act(async () => {
      await result.current.goNext();
    });

    expect(capturedUrl).toContain("exclude=42");
    expect(result.current.currentTokenId).toBe(99);
  });
});
