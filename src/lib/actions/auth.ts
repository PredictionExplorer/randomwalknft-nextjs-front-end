"use server";

import { redirect } from "next/navigation";

import { loginAdmin, registerAdmin } from "@/lib/api/public";
import { clearSession, writeSession } from "@/lib/auth/session";

export async function loginAction(_: { error?: string } | null, formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return { error: "Please enter a valid email and password." };
  }

  const response = await loginAdmin(email, password);
  if (response.result !== "success" || !response.token) {
    return { error: "Login failed. Please check your credentials." };
  }

  await writeSession({ email, token: response.token });
  redirect("/admin");
}

export async function registerAction(
  _: { error?: string; success?: string } | null,
  formData: FormData
) {
  const username = formData.get("username");
  const email = formData.get("email");
  const password = formData.get("password");

  if (
    typeof username !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return { error: "Please complete the registration form." };
  }

  const response = await registerAdmin(username, email, password);
  if (response.result !== "success") {
    return { error: "Registration failed." };
  }

  return { success: "Registration completed. You can log in now." };
}

export async function logoutAction() {
  await clearSession();
  redirect("/auth/login");
}
