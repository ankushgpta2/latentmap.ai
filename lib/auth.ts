/**
 * Server-side authentication primitives for LML.
 *
 * Design principles:
 *   - The plaintext invite code never leaves the user's browser or appears
 *     in any server log. We compare SHA-256 hashes in constant time.
 *   - Sessions are signed JWTs (HS256) carried in an httpOnly, Secure,
 *     SameSite=Lax cookie. There is no server-side session store; the
 *     cookie itself is the credential, and the secret is the only thing
 *     that can mint or verify it.
 *   - All env-var access goes through one helper so missing-secret
 *     misconfigurations fail loudly and uniformly.
 *   - Comparisons that involve secrets always go through `timingSafeEqual`
 *     to keep them resistant to timing side-channels.
 *
 * This module is import-safe from both the Node.js and the Edge runtimes
 * (Web Crypto + `jose`). Do not import Node-only modules here.
 */

import { cookies } from "next/headers";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const ENC = new TextEncoder();

/* -------------------------------------------------------------------------- */
/* Config                                                                     */
/* -------------------------------------------------------------------------- */

function requireEnv(key: string): string {
  const v = process.env[key];
  if (!v || v.length === 0) {
    throw new Error(
      `[lml-auth] Missing required environment variable: ${key}. ` +
        `See .env.example and ensure it is set in your deployment environment.`
    );
  }
  return v;
}

function getSecretKey(): Uint8Array {
  const secret = requireEnv("SESSION_SECRET");
  if (secret.length < 32) {
    throw new Error(
      "[lml-auth] SESSION_SECRET must be at least 32 characters. " +
        "Generate one with `npm run generate-secret`."
    );
  }
  return ENC.encode(secret);
}

function getInviteHash(): string {
  const h = requireEnv("INVITE_CODE_HASH");
  if (!/^[0-9a-f]{64}$/i.test(h)) {
    throw new Error(
      "[lml-auth] INVITE_CODE_HASH must be a 64-char hex SHA-256 hash. " +
        "Generate one with `npm run generate-hash`."
    );
  }
  return h.toLowerCase();
}

function getSessionTTL(): number {
  const raw = process.env.SESSION_TTL_SECONDS;
  const n = raw ? Number(raw) : 86400;
  return Number.isFinite(n) && n > 0 ? n : 86400;
}

export function getCookieName(): string {
  return process.env.SESSION_COOKIE_NAME ?? "lml_session";
}

/* -------------------------------------------------------------------------- */
/* Hashing & constant-time compare                                            */
/* -------------------------------------------------------------------------- */

export async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", ENC.encode(input));
  const bytes = new Uint8Array(buf);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

/**
 * Constant-time string equality. Falls back to a deterministic loop so it
 * does not short-circuit on the first differing byte (which would leak
 * information through timing). Both inputs are forced to the length of the
 * left side; mismatched lengths still return false but at constant cost.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  const aBytes = ENC.encode(a);
  const bBytes = ENC.encode(b);
  const len = aBytes.length;
  let diff = aBytes.length ^ bBytes.length;
  for (let i = 0; i < len; i++) {
    diff |= aBytes[i] ^ (bBytes[i] ?? 0);
  }
  return diff === 0;
}

export async function verifyInviteCode(submitted: string): Promise<boolean> {
  if (typeof submitted !== "string" || submitted.length === 0) return false;
  if (submitted.length > 256) return false;
  const submittedHash = await sha256Hex(submitted.trim());
  const expectedHash = getInviteHash();
  return timingSafeEqual(submittedHash, expectedHash);
}

/* -------------------------------------------------------------------------- */
/* Session JWT                                                                */
/* -------------------------------------------------------------------------- */

type LmlSessionClaims = JWTPayload & {
  sub: "researcher";
  scope: "protected";
};

export async function mintSessionToken(): Promise<string> {
  const ttl = getSessionTTL();
  const iat = Math.floor(Date.now() / 1000);
  const claims: LmlSessionClaims = {
    sub: "researcher",
    scope: "protected",
    iat,
    exp: iat + ttl,
  };
  return await new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .sign(getSecretKey());
}

export async function verifySessionToken(
  token: string | undefined | null
): Promise<LmlSessionClaims | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });
    if (payload.scope !== "protected" || payload.sub !== "researcher") {
      return null;
    }
    return payload as LmlSessionClaims;
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Cookie helpers                                                             */
/* -------------------------------------------------------------------------- */

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: getSessionTTL(),
  };
}

export async function isAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  const tok = jar.get(getCookieName())?.value;
  const claims = await verifySessionToken(tok);
  return claims !== null;
}
