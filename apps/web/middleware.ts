import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_USER_KEY = "mediassist.auth.user";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    const authCookie = request.cookies.get(AUTH_USER_KEY);
    if (!authCookie || !authCookie.value) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
