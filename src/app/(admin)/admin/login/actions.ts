"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  adminSessionCookieName,
  createAdminSessionToken,
  getAdminAuthConfig,
  getAdminSessionCookieOptions,
  verifyAdminCredentials,
} from "@/lib/admin-auth";

export type AdminLoginState = Readonly<{
  status: "idle" | "error";
  message?: string;
  email: string;
  nextPath: string;
}>;

function readFormString(formData: FormData, fieldName: string) {
  const value = formData.get(fieldName);

  return typeof value === "string" ? value.trim() : "";
}

function normalizeNextPath(nextPath: string) {
  if (
    nextPath.startsWith("/admin") &&
    !nextPath.startsWith("/admin/login") &&
    !nextPath.startsWith("//")
  ) {
    return nextPath;
  }

  return "/admin";
}

function errorState(message: string, email: string, nextPath: string): AdminLoginState {
  return {
    status: "error",
    message,
    email,
    nextPath,
  };
}

export async function loginAdmin(_previousState: AdminLoginState, formData: FormData) {
  const email = readFormString(formData, "email");
  const password = readFormString(formData, "password");
  const nextPath = normalizeNextPath(readFormString(formData, "nextPath"));
  const config = getAdminAuthConfig();

  if (!config.configured) {
    return errorState(`Admin auth is missing ${config.missing.join(", ")}`, email, nextPath);
  }

  if (!email || !password) {
    return errorState("Enter the admin email and password", email, nextPath);
  }

  const authenticated = await verifyAdminCredentials(email, password);

  if (!authenticated) {
    return errorState("Invalid admin credentials", email, nextPath);
  }

  const sessionToken = await createAdminSessionToken(email);
  const cookieStore = await cookies();
  cookieStore.set(adminSessionCookieName, sessionToken, getAdminSessionCookieOptions());

  redirect(nextPath);
}
