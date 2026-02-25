import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth0, auth0Enabled } from "@/lib/auth0";

export async function proxy(request: NextRequest) {
  const devBypass = process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === "true";
  const { pathname } = request.nextUrl;

  if (devBypass && (pathname === "/auth/login" || pathname === "/auth/logout")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/auth/login" ? "/login" : "/logout";
    return NextResponse.redirect(url);
  }

  if (devBypass || !auth0Enabled || !auth0) {
    return NextResponse.next();
  }
  return auth0.middleware(request);
}

export const config = {
  matcher: ["/auth/:path*", "/dashboard/:path*", "/seller/:path*", "/admin/:path*"],
};
