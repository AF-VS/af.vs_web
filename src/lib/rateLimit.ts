// Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.
// Install via: Vercel Marketplace → Upstash → Redis (auto-populates env).
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let limiter: Ratelimit | null = null;

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

export async function checkRateLimit(ip: string): Promise<{ success: boolean; retryAfter?: number }> {
  const rl = getLimiter();
  if (!rl) {
    console.warn('[rate-limit] Upstash not configured, fail-open');
    return { success: true };
  }
  const { success, reset } = await rl.limit(ip);
  return { success, retryAfter: success ? undefined : Math.ceil((reset - Date.now()) / 1000) };
}
