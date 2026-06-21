/**
 * Tiny in-memory rate limiter for login attempts.
 *
 * Caveats — read before scaling:
 *   - State lives in the function instance's heap. On Vercel Serverless,
 *     limits are effectively per-warm-instance, not strictly global. For a
 *     pre-launch invite-gated site this is adequate; for production scale,
 *     swap the backing Map for `@vercel/kv` or Upstash Redis.
 *   - We key on a coarse client identifier (IP) so a sophisticated attacker
 *     behind a rotating proxy can in principle bypass it. The invite code
 *     itself remains the load-bearing security primitive; rate limiting is
 *     defense in depth, not the only defense.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

function getMaxAttempts(): number {
  const n = Number(process.env.RATE_LIMIT_MAX_ATTEMPTS ?? "5");
  return Number.isFinite(n) && n > 0 ? n : 5;
}

function getWindowSeconds(): number {
  const n = Number(process.env.RATE_LIMIT_WINDOW_SECONDS ?? "900");
  return Number.isFinite(n) && n > 0 ? n : 900;
}

export function rateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const max = getMaxAttempts();
  const windowMs = getWindowSeconds() * 1000;

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    const fresh: Bucket = { count: 1, resetAt: now + windowMs };
    buckets.set(key, fresh);
    pruneIfLarge();
    return { allowed: true, remaining: max - 1, resetAt: fresh.resetAt };
  }

  if (existing.count >= max) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: max - existing.count,
    resetAt: existing.resetAt,
  };
}

/**
 * Caps the map at 5000 entries so a hostile party flooding the limiter with
 * unique keys cannot exhaust process memory. Expired entries are dropped
 * first; otherwise the oldest entries are evicted.
 */
function pruneIfLarge() {
  if (buckets.size <= 5000) return;
  const now = Date.now();
  for (const [k, v] of buckets) {
    if (v.resetAt <= now) buckets.delete(k);
    if (buckets.size <= 4500) return;
  }
  let toDrop = buckets.size - 4500;
  for (const k of buckets.keys()) {
    if (toDrop-- <= 0) break;
    buckets.delete(k);
  }
}

export function clientKeyFromHeaders(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = headers.get("x-real-ip");
  if (real) return real;
  return "anon";
}
