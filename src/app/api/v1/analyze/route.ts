import { NextRequest } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { withApiAuth } from '@/lib/api/middleware';
import { successResponse, errorResponse } from '@/lib/api/response';
import { analyzeContent } from '@/lib/ai/minimax';
import { prisma } from '@/lib/db/prisma';
import { redis } from '@/lib/cache/redis';

const analyzeSchema = z.object({
  content: z.string().min(100, 'Content must be at least 100 characters').max(50000),
  title: z.string().optional(),
  options: z.object({
    include_keywords: z.boolean().default(true),
    include_readability: z.boolean().default(true),
    include_seo: z.boolean().default(true),
    keyword_focus: z.string().optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  return withApiAuth(request, async (req, keyData, rateLimit) => {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();

    try {
      const body = await req.json();
      const validation = analyzeSchema.safeParse(body);

      if (!validation.success) {
        return errorResponse(
          'INVALID_REQUEST',
          validation.error.issues[0].message,
          400,
          { field: validation.error.issues[0].path.join('.') }
        );
      }

      const { content, title, options } = validation.data;

      // Check cache
      const contentHash = crypto.createHash('md5').update(content).digest('hex');
      const cachedResult = await redis.get(`analysis:${contentHash}`);

      if (cachedResult) {
        const cached = typeof cachedResult === 'string' ? JSON.parse(cachedResult) : cachedResult;

        await logUsage(keyData, requestId, '/api/v1/analyze', 200, Date.now() - startTime, {
          wordCount: cached.word_count,
          cached: true,
        });

        return successResponse(cached, {
          usage: {
            daily_remaining: rateLimit.dailyRemaining!,
            monthly_remaining: rateLimit.monthlyRemaining!,
          },
          headers: {
            'X-Request-Id': requestId,
            'X-Cache': 'HIT',
          },
        });
      }

      // Perform analysis
      const result = await analyzeContent({ content, title, options });

      // Cache for 24 hours
      await redis.setex(`analysis:${contentHash}`, 86400, JSON.stringify(result));

      // Update usage
      await prisma.apiKey.update({
        where: { id: keyData.id },
        data: {
          totalRequests: { increment: 1 },
          successfulRequests: { increment: 1 },
          dailyUsage: { increment: 1 },
          monthlyUsage: { increment: 1 },
          lastUsedAt: new Date(),
        },
      });

      await logUsage(keyData, requestId, '/api/v1/analyze', 200, Date.now() - startTime, {
        wordCount: result.word_count,
        tokensUsed: result.tokens_used,
      });

      return successResponse(result, {
        usage: {
          daily_remaining: rateLimit.dailyRemaining! - 1,
          monthly_remaining: rateLimit.monthlyRemaining! - 1,
        },
        headers: {
          'X-Request-Id': requestId,
          'X-RateLimit-Remaining': String(rateLimit.remaining - 1),
        },
      });
    } catch (error: any) {
      await logUsage(keyData, requestId, '/api/v1/analyze', 500, Date.now() - startTime, {
        errorMessage: error.message,
      });

      return errorResponse('INTERNAL_ERROR', 'Analysis failed', 500, { request_id: requestId });
    }
  });
}

async function logUsage(keyData: any, requestId: string, endpoint: string, statusCode: number, processingTimeMs: number, extra?: any) {
  await prisma.usageLog.create({
    data: {
      apiKeyId: keyData.id,
      userId: keyData.userId,
      endpoint,
      method: 'POST',
      statusCode,
      processingTimeMs,
      requestId,
      ipAddress: 'unknown',
      tokensUsed: extra?.tokensUsed,
      wordCount: extra?.wordCount,
      errorMessage: extra?.errorMessage,
    },
  }).catch(console.error);
}
