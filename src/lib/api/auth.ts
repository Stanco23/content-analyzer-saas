import crypto from 'crypto';
import { prisma } from '@/lib/db/prisma';
import { redis } from '@/lib/cache/redis';
import { ApiKeyTier, Environment } from '@prisma/client';

interface GeneratedKey {
  id: string;
  key: string;
  prefix: string;
  lastFour: string;
}

export async function generateApiKey(
  userId: string,
  name: string,
  tier: ApiKeyTier,
  environment: Environment = 'PRODUCTION'
): Promise<GeneratedKey> {
  const randomBytes = crypto.randomBytes(32);
  const randomString = randomBytes.toString('hex');

  const envPrefix = environment === 'PRODUCTION' ? 'live' : 'test';
  const fullKey = `ca_${envPrefix}_sk_${randomString}`;

  const hashedKey = crypto
    .createHash('sha256')
    .update(fullKey)
    .digest('hex');

  const keyPrefix = fullKey.substring(0, 20);
  const lastFourChars = fullKey.slice(-4);

  const limits = getRateLimitsForTier(tier);

  const apiKey = await prisma.apiKey.create({
    data: {
      userId,
      name,
      keyPrefix,
      hashedKey,
      lastFourChars,
      environment,
      tier,
      rateLimit: limits.perMinute,
      dailyLimit: limits.perDay,
      monthlyLimit: limits.perMonth,
    },
  });

  return {
    id: apiKey.id,
    key: fullKey,
    prefix: keyPrefix,
    lastFour: lastFourChars,
  };
}

export function getRateLimitsForTier(tier: ApiKeyTier) {
  const limits: Record<ApiKeyTier, { perMinute: number; perDay: number; perMonth: number }> = {
    STARTER: { perMinute: 10, perDay: 100, perMonth: 3000 },
    GROWTH: { perMinute: 60, perDay: 1000, perMonth: 30000 },
    ENTERPRISE: { perMinute: 300, perDay: 10000, perMonth: 300000 },
  };
  return limits[tier];
}

export async function validateApiKey(apiKey: string) {
  if (!apiKey.match(/^ca_(live|test)_sk_[a-f0-9]{64}$/)) {
    return { valid: false, error: 'Invalid API key format', statusCode: 401 };
  }

  const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');

  // Check cache first
  const cachedData = await redis.get(`apikey:${hashedKey}`);
  let keyData = cachedData ? (typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData) : null;

  if (!keyData) {
    keyData = await prisma.apiKey.findUnique({
      where: { hashedKey },
      include: { user: true },
    });

    if (!keyData) {
      return { valid: false, error: 'Invalid API key', statusCode: 401 };
    }

    await redis.setex(`apikey:${hashedKey}`, 300, JSON.stringify(keyData));
  }

  if (!keyData.isActive || keyData.revokedAt) {
    return { valid: false, error: 'API key has been revoked', statusCode: 401 };
  }

  if (keyData.expiresAt && new Date(keyData.expiresAt) < new Date()) {
    return { valid: false, error: 'API key has expired', statusCode: 401 };
  }

  return { valid: true, keyData };
}

export async function revokeApiKey(keyId: string, reason?: string) {
  const apiKey = await prisma.apiKey.update({
    where: { id: keyId },
    data: {
      isActive: false,
      revokedAt: new Date(),
      revokedReason: reason,
    },
  });

  // Invalidate cache
  await redis.del(`apikey:${apiKey.hashedKey}`);

  return apiKey;
}
