import { NextRequest } from 'next/server';
import { validateApiKey } from './auth';
import { checkRateLimit } from './rate-limiter';
import { errorResponse } from './response';

export async function withApiAuth(
  request: NextRequest,
  handler: (req: NextRequest, keyData: any, rateLimit: any) => Promise<Response>
): Promise<Response> {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse('INVALID_API_KEY', 'Missing or invalid Authorization header', 401);
  }

  const apiKey = authHeader.replace('Bearer ', '');
  const authResult = await validateApiKey(apiKey);

  if (!authResult.valid) {
    return errorResponse('INVALID_API_KEY', authResult.error!, authResult.statusCode!);
  }

  const { keyData } = authResult;

  // Check IP whitelist
  if (keyData.ipWhitelist && keyData.ipWhitelist.length > 0) {
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                     request.headers.get('x-real-ip') || 'unknown';
    if (!keyData.ipWhitelist.includes(clientIp)) {
      return errorResponse('IP_NOT_WHITELISTED', 'IP address not whitelisted', 403);
    }
  }

  // Check rate limits
  const rateLimitResult = await checkRateLimit(keyData.id, {
    perMinute: keyData.rateLimit,
    perDay: keyData.dailyLimit,
    perMonth: keyData.monthlyLimit,
  });

  if (!rateLimitResult.allowed) {
    return errorResponse(
      'RATE_LIMIT_EXCEEDED',
      `Rate limit exceeded: ${rateLimitResult.limit} requests per ${rateLimitResult.type}`,
      429,
      {
        limit: rateLimitResult.limit,
        remaining: 0,
        reset_at: rateLimitResult.resetAt.toISOString(),
      }
    );
  }

  return handler(request, keyData, rateLimitResult);
}
