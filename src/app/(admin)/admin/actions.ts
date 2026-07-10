"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { adminSessionCookieName, getExpiredAdminSessionCookieOptions } from "@/lib/admin-auth";

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.set(adminSessionCookieName, "", getExpiredAdminSessionCookieOptions());
  redirect("/admin/login");
}
