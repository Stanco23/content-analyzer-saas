import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ success: false, error: { message: "User not found" } }, { status: 404 });

  const apiKeys = await prisma.apiKey.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      name: true,
      tier: true,
      dailyUsage: true,
      dailyLimit: true,
      monthlyUsage: true,
      monthlyLimit: true,
      totalRequests: true,
      successfulRequests: true,
      failedRequests: true,
    },
  });

  const recentLogs = await prisma.usageLog.findMany({
    where: { userId: user.id },
    orderBy: { timestamp: "desc" },
    take: 20,
    select: {
      id: true,
      endpoint: true,
      statusCode: true,
      processingTimeMs: true,
      tokensUsed: true,
      timestamp: true,
    },
  });

  const totalRequests = apiKeys.reduce((sum, k) => sum + k.totalRequests, 0);
  const totalSuccess = apiKeys.reduce((sum, k) => sum + k.successfulRequests, 0);

  const stats = {
    totalRequests,
    successRate: totalRequests > 0 ? (totalSuccess / totalRequests) * 100 : 0,
    activeKeys: apiKeys.filter(k => k.totalRequests > 0).length,
  };

  return NextResponse.json({
    success: true,
    data: {
      apiKeys,
      recentLogs,
      stats,
    },
  });
}
