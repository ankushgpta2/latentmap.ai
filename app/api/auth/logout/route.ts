import { NextResponse, type NextRequest } from "next/server";
import { getCookieName } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function buildRedirect(req: NextRequest) {
  const url = new URL("/", req.url);
  const res = NextResponse.redirect(url, 303);
  res.cookies.set(getCookieName(), "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
  return res;
}

export async function POST(req: NextRequest) {
  return buildRedirect(req);
}

// Support GET for non-JS fallback (e.g. an unenhanced <a> link).
export async function GET(req: NextRequest) {
  return buildRedirect(req);
}
