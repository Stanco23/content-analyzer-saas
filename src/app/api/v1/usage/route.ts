import { NextRequest } from 'next/server';
import { withApiAuth } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import { prisma } from '@/lib/db/prisma';

export async function GET(request: NextRequest) {
  return withApiAuth(request, async (req, keyData, rateLimit) => {
    const stats = await prisma.usageLog.aggregate({
      where: { apiKeyId: keyData.id },
      _count: true,
      _avg: { processingTimeMs: true },
      _sum: { tokensUsed: true },
    });

    return successResponse({
      api_key: {
        name: keyData.name,
        tier: keyData.tier,
        created_at: keyData.createdAt,
      },
      limits: {
        per_minute: keyData.rateLimit,
        per_day: keyData.dailyLimit,
        per_month: keyData.monthlyLimit,
      },
      usage: {
        today: keyData.dailyUsage,
        this_month: keyData.monthlyUsage,
        daily_remaining: keyData.dailyLimit - keyData.dailyUsage,
        monthly_remaining: keyData.monthlyLimit - keyData.monthlyUsage,
      },
      statistics: {
        total_requests: keyData.totalRequests,
        successful_requests: keyData.successfulRequests,
        failed_requests: keyData.failedRequests,
        avg_processing_time_ms: Math.round(stats._avg.processingTimeMs || 0),
        total_tokens_used: stats._sum.tokensUsed || 0,
      },
    });
  });
}
