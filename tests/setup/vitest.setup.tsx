import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import React from "react";

import { server } from "./msw/server";

Object.assign(process.env, {
  NEXT_PUBLIC_SITE_URL: "https://test.example.com",
  NEXT_PUBLIC_SITE_NAME: "Test Site",
  NEXT_PUBLIC_SITE_DESCRIPTION: "Test description",
  NEXT_PUBLIC_API_BASE_URL: "https://api.test.example.com",
  NEXT_PUBLIC_NETWORK: "mainnet",
  NEXT_PUBLIC_RPC_URL: "https://arb1.arbitrum.io/rpc"
});

// Hermeticity: the rotation lists (server-rotation.ts) must not leak in from the shell,
// or tests would fetch against whatever servers the developer has exported.
delete process.env.NEXT_PUBLIC_API_URLS;
delete process.env.NEXT_PUBLIC_RPC_URLS;

// jsdom does not implement matchMedia (used for prefers-reduced-motion checks).
if (typeof window !== "undefined" && typeof window.matchMedia !== "function") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false
    })
  });
}

// jsdom has no ResizeObserver; the stage and constellation size themselves with it.
if (typeof window !== "undefined" && typeof window.ResizeObserver !== "function") {
  class ResizeObserverStub {
    private readonly callback: ResizeObserverCallback;
    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }
    observe(target: Element) {
      // Fire once so components measure their (jsdom-sized) box on mount.
      this.callback([{ target } as ResizeObserverEntry], this as unknown as ResizeObserver);
    }
    unobserve() {}
    disconnect() {}
  }
  Object.defineProperty(window, "ResizeObserver", { writable: true, value: ResizeObserverStub });
}

// Cache Components APIs need the Next runtime; in unit tests they are inert annotations.
// jsdom has no IntersectionObserver either; report everything as on screen at once.
if (typeof window !== "undefined" && typeof window.IntersectionObserver !== "function") {
  class IntersectionObserverStub {
    private readonly callback: IntersectionObserverCallback;
    constructor(callback: IntersectionObserverCallback) {
      this.callback = callback;
    }
    observe(target: Element) {
      this.callback(
        [{ target, isIntersecting: true, intersectionRatio: 1 } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver
      );
    }
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  Object.defineProperty(window, "IntersectionObserver", { writable: true, value: IntersectionObserverStub });
}

vi.mock("next/cache", () => ({
  cacheLife: () => undefined,
  cacheTag: () => undefined,
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
  updateTag: vi.fn(),
  unstable_noStore: () => undefined
}));

vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/server")>();
  return { ...actual, connection: () => Promise.resolve() };
});

vi.mock("next/image", () => ({
  default: ({
    fill: _fill,
    priority: _priority,
    unoptimized: _unoptimized,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean; unoptimized?: boolean }) => (
    <img {...props} alt={props.alt ?? ""} />
  )
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}));

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
