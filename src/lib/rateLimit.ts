// Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.
// Install via: Vercel Marketplace → Upstash → Redis (auto-populates env).
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let limiter: Ratelimit | null = null;
let warnedDisabled = false;

function getLimiter(): Ratelimit | null {
  if (limiter) return limiter;
  const url = import.meta.env.UPSTASH_REDIS_REST_URL;
  const token = import.meta.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const redis = new Redis({ url, token });
  limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    analytics: false,
    prefix: 'afvs:contact',
  });
  return limiter;
}

/**
 * Check rate limit for a given IP address.
 *
 * Fail-open policy: if Upstash env vars are missing, or if the Upstash call
 * fails due to a transient outage, the function returns `{ success: true }` so
 * real users are never 500-ed. A warning is logged once per process when env
 * vars are absent; errors on transient failures are logged on every occurrence
 * so ops can notice an outage.
 */
export async function checkRateLimit(ip: string): Promise<{ success: boolean; retryAfter?: number }> {
  const rl = getLimiter();
  if (!rl) {
    if (!warnedDisabled) {
      console.warn('[rate-limit] DISABLED — UPSTASH_REDIS_REST_URL/TOKEN missing, all requests will pass through');
      warnedDisabled = true;
    }
    return { success: true };
  }
  try {
    const { success, reset } = await rl.limit(ip);
    if (success) return { success: true };
    return { success: false, retryAfter: Math.ceil((reset - Date.now()) / 1000) };
  } catch (err) {
    console.error('[rate-limit] Upstash call failed, fail-open:', err);
    return { success: true };
  }
}
