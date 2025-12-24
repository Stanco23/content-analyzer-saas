import { NextRequest } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { withApiAuth } from '@/lib/api/middleware';
import { successResponse, errorResponse } from '@/lib/api/response';
import { analyzeContent } from '@/lib/ai/minimax';
import { prisma } from '@/lib/db/prisma';

const batchSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    content: z.string().min(100).max(50000),
    title: z.string().optional(),
  })).min(1).max(10),
  options: z.object({
    include_keywords: z.boolean().default(true),
    include_readability: z.boolean().default(true),
    include_seo: z.boolean().default(true),
  }).optional(),
});

export async function POST(request: NextRequest) {
  return withApiAuth(request, async (req, keyData, rateLimit) => {
    const requestId = crypto.randomUUID();

    try {
      const body = await req.json();
      const validation = batchSchema.safeParse(body);

      if (!validation.success) {
        return errorResponse('INVALID_REQUEST', validation.error.issues[0].message, 400);
      }

      const { items, options } = validation.data;

      // Check if enough quota
      if (items.length > rateLimit.dailyRemaining!) {
        return errorResponse('QUOTA_EXCEEDED', 'Not enough daily quota for batch', 402);
      }

      const results = await Promise.allSettled(
        items.map(item => analyzeContent({ content: item.content, title: item.title, options }))
      );

      const formattedResults = results.map((result, index) => ({
        id: items[index].id,
        status: result.status === 'fulfilled' ? 'success' : 'failed',
        analysis: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason.message : null,
      }));

      const successful = formattedResults.filter(r => r.status === 'success').length;
      const totalTokens = formattedResults
        .filter(r => r.analysis)
        .reduce((sum, r) => sum + (r.analysis?.tokens_used || 0), 0);

      await prisma.apiKey.update({
        where: { id: keyData.id },
        data: {
          totalRequests: { increment: items.length },
          successfulRequests: { increment: successful },
          failedRequests: { increment: items.length - successful },
          dailyUsage: { increment: items.length },
          monthlyUsage: { increment: items.length },
          lastUsedAt: new Date(),
        },
      });

      return successResponse({
        results: formattedResults,
        total_items: items.length,
        successful,
        failed: items.length - successful,
        total_tokens_used: totalTokens,
      }, {
        usage: {
          daily_remaining: rateLimit.dailyRemaining! - items.length,
          monthly_remaining: rateLimit.monthlyRemaining! - items.length,
        },
        headers: { 'X-Request-Id': requestId },
      });
    } catch (error: any) {
      return errorResponse('INTERNAL_ERROR', 'Batch analysis failed', 500, { request_id: requestId });
    }
  });
}
