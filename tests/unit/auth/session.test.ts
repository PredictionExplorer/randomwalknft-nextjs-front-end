// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const cookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn()
};

const redirect = vi.fn();
const checkAdminToken = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => cookieStore)
}));

vi.mock("next/navigation", () => ({
  redirect
}));

vi.mock("@/lib/api/public", () => ({
  checkAdminToken
}));

describe("session helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reads and decodes a valid session cookie", async () => {
    const session = { email: "admin@example.com", token: "secret" };
    cookieStore.get.mockReturnValue({
      value: Buffer.from(JSON.stringify(session), "utf8").toString("base64url")
    });

    const { readSession } = await import("@/lib/auth/session");
    await expect(readSession()).resolves.toEqual(session);
  });

  it("writes the session as an httpOnly cookie", async () => {
    const { writeSession } = await import("@/lib/auth/session");
    await writeSession({ email: "admin@example.com", token: "secret" });

    expect(cookieStore.set).toHaveBeenCalledWith(
      "randomwalknft_session",
      expect.any(String),
      expect.objectContaining({ httpOnly: true, secure: true })
    );
  });

  it("clears invalid sessions during validation", async () => {
    checkAdminToken.mockResolvedValue({ result: "error" });
    const { validateSession } = await import("@/lib/auth/session");

    await expect(validateSession({ email: "admin@example.com", token: "secret" })).resolves.toBeNull();
    expect(cookieStore.delete).toHaveBeenCalledWith("randomwalknft_session");
  });

  it("redirects when a required session is missing", async () => {
    cookieStore.get.mockReturnValue(undefined);
    const { requireSession } = await import("@/lib/auth/session");

    await requireSession();
    expect(redirect).toHaveBeenCalledWith("/auth/login");
  });
});
