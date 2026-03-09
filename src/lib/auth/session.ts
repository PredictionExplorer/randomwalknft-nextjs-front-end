import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_SESSION_HOURS, SESSION_COOKIE } from "@/lib/config";
import { checkAdminToken } from "@/lib/api/public";
import type { AuthSession } from "@/lib/types";

function encodeSession(session: AuthSession) {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}

function decodeSession(value: string): AuthSession | null {
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as AuthSession;
    return parsed.email && parsed.token ? parsed : null;
  } catch {
    return null;
  }
}

export async function readSession() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;

  return raw ? decodeSession(raw) : null;
}

export async function writeSession(session: AuthSession) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, encodeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: ADMIN_SESSION_HOURS * 60 * 60
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function validateSession(session: AuthSession | null) {
  if (!session) {
    return null;
  }

  const response = await checkAdminToken(session.email, session.token);
  if (response.result !== "success") {
    await clearSession();
    return null;
  }

  return session;
}

export async function requireSession() {
  const session = await validateSession(await readSession());
  if (!session) {
    redirect("/auth/login");
  }

  return session;
}
