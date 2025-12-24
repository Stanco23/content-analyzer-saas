import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { analyzeContent } from "@/lib/ai/minimax";

const analyzeSchema = z.object({
  content: z.string().min(100, "Content must be at least 100 characters").max(50000),
  title: z.string().optional(),
  options: z.object({
    include_keywords: z.boolean().default(true),
    include_readability: z.boolean().default(true),
    include_seo: z.boolean().default(true),
    keyword_focus: z.string().optional(),
  }).optional(),
});

// Tier limits for web app users
const TIER_LIMITS = {
  FREE: 5,
  PRO: 50,
  BUSINESS: 200,
  API_STARTER: 100,
  API_GROWTH: 500,
  API_ENTERPRISE: 1000,
};

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: "User not found" } },
        { status: 404 }
      );
    }

    // Check monthly limit
    const limit = TIER_LIMITS[user.subscriptionTier] || TIER_LIMITS.FREE;

    // Reset monthly usage if new month
    const now = new Date();
    const lastReset = user.lastResetDate ? new Date(user.lastResetDate) : now;
    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
      await prisma.user.update({
        where: { id: user.id },
        data: { monthlyAnalysesUsed: 0, lastResetDate: now },
      });
      user.monthlyAnalysesUsed = 0;
    }

    if (user.monthlyAnalysesUsed >= limit) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "QUOTA_EXCEEDED",
            message: `Monthly limit of ${limit} analyses reached. Please upgrade your plan.`,
          },
        },
        { status: 402 }
      );
    }

    const body = await request.json();
    const validation = analyzeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: validation.error.issues[0].message,
            field: validation.error.issues[0].path.join("."),
          },
        },
        { status: 400 }
      );
    }

    const { content, title, options } = validation.data;

    // Perform analysis
    const result = await analyzeContent({ content, title, options });

    // Save to database
    const analysis = await prisma.analysis.create({
      data: {
        userId: user.id,
        title: title || "Untitled",
        content,
        wordCount: result.word_count,
        readabilityScore: result.readability?.score || 0,
        seoScore: result.seo?.score || 0,
        keywordDensity: result.seo?.keyword_density || {},
        suggestions: result.suggestions || [],
        tokensUsed: result.tokens_used,
        processingTimeMs: result.processing_time_ms,
      },
    } as any);

    // Update usage
    await prisma.user.update({
      where: { id: user.id },
      data: {
        analysesCount: { increment: 1 },
        monthlyAnalysesUsed: { increment: 1 },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        analysisId: analysis.id,
        ...result,
      },
      usage: {
        used: user.monthlyAnalysesUsed + 1,
        limit,
        remaining: limit - user.monthlyAnalysesUsed - 1,
      },
    });
  } catch (error: any) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error.message || "Analysis failed",
        },
      },
      { status: 500 }
    );
  }
}
