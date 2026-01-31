import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { rateLimit } from './rateLimit';

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: Redis | null = null;
const rateCache = new Map<string, Ratelimit>();

if (url && token) {
  redis = new Redis({ url, token });
}

export async function rateLimitPersistent(key: string, max = 20, windowSeconds = 60) {
  if (!redis) {
    return rateLimit(key, max, windowSeconds * 1000);
  }
  const cacheKey = `${max}:${windowSeconds}`;
  let limiter = rateCache.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(max, `${windowSeconds} s`) });
    rateCache.set(cacheKey, limiter);
  }
  const res = await limiter.limit(key);
  return { allowed: res.success, remaining: res.remaining, resetAt: Date.now() + windowSeconds * 1000 };
}
