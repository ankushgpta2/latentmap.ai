import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken, getCookieName } from "@/lib/auth";

/**
 * Routes that require a valid session cookie. Everything else is public.
 * Keep this in lockstep with the (protected) route group in app/.
 */
const PROTECTED_PATHS = ["/platform", "/team", "/careers", "/blog"] as const;

function isProtected(pathname: string): boolean {
  return PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (!isProtected(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get(getCookieName())?.value;
  const claims = await verifySessionToken(token);

  if (claims) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("next", pathname + search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  /**
   * Run middleware only on routes that could be protected. This excludes the
   * homepage, static assets, image optimization endpoints, etc., which would
   * otherwise pay the cost of an Edge function invocation per request.
   */
  matcher: ["/platform/:path*", "/team/:path*", "/careers/:path*", "/blog/:path*"],
};
