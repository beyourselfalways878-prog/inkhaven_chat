import { Ratelimit } from '@upstash/ratelimit';
import { redis } from './redis';

type RateRecord = { count: number; resetAt: number };
const memoryCache = new Map<string, RateRecord>();
const ratelimitCache = new Map<string, Ratelimit>();

/**
 * Rate limit a key.
 * Uses Redis (Upstash) if available, otherwise falls back to in-memory (LRU-like).
 * @param key Identifier
 * @param max Max requests
 * @param windowSeconds Window size in seconds
 */
export async function rateLimit(key: string, max = 20, windowSeconds = 60) {
  // 1. Redis Strategy (Preferred)
  if (redis) {
    const cacheKey = `${max}:${windowSeconds}`;
    let limiter = ratelimitCache.get(cacheKey);

    if (!limiter) {
      limiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(max, `${windowSeconds} s`),
        analytics: true,
        prefix: '@upstash/ratelimit',
      });
      ratelimitCache.set(cacheKey, limiter);
    }

    try {
      const { success, remaining, reset } = await limiter.limit(key);
      return { allowed: success, remaining, resetAt: reset };
    } catch (err) {
      console.warn('Redis rate limit failed, falling back to memory', err);
      // Fallthrough to memory
    }
  }

  // 2. In-Memory Strategy (Fallback)
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const record = memoryCache.get(key);

  if (!record || record.resetAt < now) {
    memoryCache.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1, resetAt: now + windowMs };
  }

  if (record.count >= max) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count += 1;
  return { allowed: true, remaining: max - record.count, resetAt: record.resetAt };
}
