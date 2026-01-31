type RateRecord = { count: number; resetAt: number };

const limits = new Map<string, RateRecord>();

export function rateLimit(key: string, max = 20, windowMs = 60_000) {
  const now = Date.now();
  const record = limits.get(key);

  if (!record || record.resetAt < now) {
    limits.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1, resetAt: now + windowMs };
  }

  if (record.count >= max) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count += 1;
  return { allowed: true, remaining: max - record.count, resetAt: record.resetAt };
}
