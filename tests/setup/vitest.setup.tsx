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

vi.mock("next/image", () => ({
  default: ({
    fill: _fill,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean }) => <img {...props} alt={props.alt ?? ""} />
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}));

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
