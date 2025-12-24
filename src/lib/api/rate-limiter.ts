import { redis } from '@/lib/cache/redis';

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
  type?: 'minute' | 'day' | 'month';
  dailyRemaining?: number;
  monthlyRemaining?: number;
}

export async function checkRateLimit(
  apiKeyId: string,
  limits: { perMinute: number; perDay: number; perMonth: number }
): Promise<RateLimitResult> {
  const now = Date.now();
  const minuteKey = `ratelimit:${apiKeyId}:minute:${Math.floor(now / 60000)}`;
  const dayKey = `ratelimit:${apiKeyId}:day:${new Date().toISOString().slice(0, 10)}`;
  const monthKey = `ratelimit:${apiKeyId}:month:${new Date().toISOString().slice(0, 7)}`;

  const [minuteCount, dayCount, monthCount] = await Promise.all([
    redis.incr(minuteKey),
    redis.incr(dayKey),
    redis.incr(monthKey),
  ]);

  // Set expiration on first request
  if (minuteCount === 1) await redis.expire(minuteKey, 60);
  if (dayCount === 1) await redis.expire(dayKey, 86400);
  if (monthCount === 1) await redis.expire(monthKey, 2592000);

  if (minuteCount > limits.perMinute) {
    return {
      allowed: false,
      limit: limits.perMinute,
      remaining: 0,
      resetAt: new Date(Math.ceil(now / 60000) * 60000),
      type: 'minute',
    };
  }

  if (dayCount > limits.perDay) {
    return {
      allowed: false,
      limit: limits.perDay,
      remaining: 0,
      resetAt: new Date(new Date().setHours(24, 0, 0, 0)),
      type: 'day',
    };
  }

  if (monthCount > limits.perMonth) {
    return {
      allowed: false,
      limit: limits.perMonth,
      remaining: 0,
      resetAt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
      type: 'month',
    };
  }

  return {
    allowed: true,
    limit: limits.perMinute,
    remaining: limits.perMinute - minuteCount,
    resetAt: new Date(Math.ceil(now / 60000) * 60000),
    dailyRemaining: limits.perDay - dayCount,
    monthlyRemaining: limits.perMonth - monthCount,
  };
}
