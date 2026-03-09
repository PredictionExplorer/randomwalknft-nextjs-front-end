// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

const redirect = vi.fn();
const loginAdmin = vi.fn();
const registerAdmin = vi.fn();
const writeSession = vi.fn();
const clearSession = vi.fn();
const validateSession = vi.fn();

vi.mock("next/navigation", () => ({
  redirect
}));

vi.mock("@/lib/api/public", () => ({
  loginAdmin,
  registerAdmin
}));

vi.mock("@/lib/auth/session", () => ({
  clearSession,
  validateSession,
  writeSession
}));

describe("auth actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns an error for invalid login payloads", async () => {
    const { loginAction } = await import("@/lib/actions/auth");
    const result = await loginAction(null, new FormData());
    expect(result).toEqual({ error: "Please enter a valid email and password." });
  });

  it("writes a session and redirects on login success", async () => {
    loginAdmin.mockResolvedValue({ result: "success", token: "token-1" });
    const { loginAction } = await import("@/lib/actions/auth");
    const formData = new FormData();
    formData.set("email", "admin@example.com");
    formData.set("password", "hunter2");

    await loginAction(null, formData);

    expect(writeSession).toHaveBeenCalledWith({
      email: "admin@example.com",
      token: "token-1"
    });
    expect(redirect).toHaveBeenCalledWith("/admin");
  });

  it("returns success for a valid registration", async () => {
    registerAdmin.mockResolvedValue({ result: "success" });
    const { registerAction } = await import("@/lib/actions/auth");
    const formData = new FormData();
    formData.set("username", "admin");
    formData.set("email", "admin@example.com");
    formData.set("password", "hunter2");

    await expect(registerAction(null, formData)).resolves.toEqual({
      success: "Registration completed. You can log in now."
    });
  });

  it("clears the session and redirects on logout", async () => {
    const { logoutAction } = await import("@/lib/actions/auth");
    await logoutAction();

    expect(clearSession).toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith("/auth/login");
  });
});
