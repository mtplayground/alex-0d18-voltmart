import { NextResponse, type NextRequest } from "next/server";

import { adminSessionCookieName, verifyAdminSessionToken } from "@/lib/admin-auth";

function loginUrl(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";

  if (request.nextUrl.pathname !== "/admin") {
    url.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  }

  return url;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isLoginPage = pathname === "/admin/login";
  const sessionToken = request.cookies.get(adminSessionCookieName)?.value;
  const adminEmail = await verifyAdminSessionToken(sessionToken);

  if (!adminEmail && !isLoginPage) {
    return NextResponse.redirect(loginUrl(request));
  }

  if (adminEmail && isLoginPage) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
