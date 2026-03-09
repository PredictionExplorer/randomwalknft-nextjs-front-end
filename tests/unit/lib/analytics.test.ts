import { describe, expect, it, vi } from "vitest";

import { trackEvent, trackWebVital } from "@/lib/analytics";

describe("analytics", () => {
  it("pushes to dataLayer when it exists", () => {
    window.dataLayer = [];
    trackEvent("transaction_submitted", { flow: "mint" });
    expect(window.dataLayer).toHaveLength(1);
    expect(window.dataLayer![0]).toMatchObject({ event: "transaction_submitted", flow: "mint" });
    delete window.dataLayer;
  });

  it("dispatches a custom event", () => {
    const handler = vi.fn();
    window.addEventListener("randomwalk:analytics", handler);
    trackEvent("wallet_connect_attempt");
    expect(handler).toHaveBeenCalledOnce();
    window.removeEventListener("randomwalk:analytics", handler);
  });

  it("does not error when dataLayer is missing", () => {
    delete window.dataLayer;
    expect(() => trackEvent("transaction_confirmed")).not.toThrow();
  });

  it("trackWebVital calls trackEvent with metric data", () => {
    window.dataLayer = [];
    trackWebVital("LCP", 2.567, "good");
    expect(window.dataLayer![0]).toMatchObject({
      event: "web_vital",
      metric: "LCP",
      value: 2.57,
      rating: "good"
    });
    delete window.dataLayer;
  });

  it("is a no-op when window is not defined (server-side)", () => {
    const originalWindow = globalThis.window;
    // @ts-expect-error -- simulate server environment
    delete globalThis.window;
    expect(() => trackEvent("transaction_submitted")).not.toThrow();
    globalThis.window = originalWindow;
  });
});
