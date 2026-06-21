import { NextResponse, type NextRequest } from "next/server";
import {
  getCookieName,
  getSessionCookieOptions,
  mintSessionToken,
  verifyInviteCode,
} from "@/lib/auth";
import { clientKeyFromHeaders, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LoginBody = { code?: unknown };

const GENERIC_ERROR =
  "That code didn't work. Check it and try again, or request access.";

export async function POST(req: NextRequest) {
  const clientKey = clientKeyFromHeaders(req.headers);
  const limit = rateLimit(`login:${clientKey}`);

  if (!limit.allowed) {
    const retrySeconds = Math.max(
      0,
      Math.ceil((limit.resetAt - Date.now()) / 1000)
    );
    return NextResponse.json(
      {
        ok: false,
        error: "Too many attempts. Try again in a few minutes.",
        retryAfterSeconds: retrySeconds,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retrySeconds),
        },
      }
    );
  }

  let body: LoginBody;
  try {
    body = (await req.json()) as LoginBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: GENERIC_ERROR },
      { status: 400 }
    );
  }

  const code = typeof body.code === "string" ? body.code : "";
  if (!code) {
    return NextResponse.json(
      { ok: false, error: GENERIC_ERROR },
      { status: 400 }
    );
  }

  const ok = await verifyInviteCode(code);
  if (!ok) {
    return NextResponse.json(
      { ok: false, error: GENERIC_ERROR },
      { status: 401 }
    );
  }

  const token = await mintSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(getCookieName(), token, getSessionCookieOptions());
  return res;
}
