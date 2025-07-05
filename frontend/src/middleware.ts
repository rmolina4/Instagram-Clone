import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isLoggedIn = !!request.cookies.get("sid")?.value;
  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname.includes("/accounts");

  if (!isAuthRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/accounts/login", request.url));
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
