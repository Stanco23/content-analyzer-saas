import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";

const saveEnhancementSchema = z.object({
  originalContent: z.string().min(1),
  enhancedContent: z.string().min(1),
  title: z.string().optional(),
  originalAnalysisId: z.string().optional(),
});

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

    const body = await request.json();
    const validation = saveEnhancementSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: validation.error.issues[0].message,
          },
        },
        { status: 400 }
      );
    }

    const { originalContent, enhancedContent, title, originalAnalysisId } = validation.data;

    const wordCount = originalContent.split(/\s+/).filter(Boolean).length;

    // Create new analysis record for the enhanced content
    const analysis = await prisma.analysis.create({
      data: {
        userId: user.id,
        title: title || `Enhanced: ${new Date().toLocaleDateString()}`,
        content: enhancedContent,
        wordCount,
        readabilityScore: null,
        seoScore: null,
        grammarScore: null,
        accessibilityScore: null,
        engagementScore: null,
        originalityScore: null,
        sentimentScore: null,
        sourceRelevanceScore: null,
        keywordDensity: {},
        suggestions: [],
        enhancedContent: enhancedContent,
        isEnhanced: true,
        originalAnalysisId: originalAnalysisId || null,
        tokensUsed: Math.ceil(enhancedContent.length / 4),
        processingTimeMs: 100,
      },
    });

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
        message: "Enhancement saved to history",
      },
    });
  } catch (error: any) {
    console.error("Save enhancement error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error.message || "Failed to save enhancement",
        },
      },
      { status: 500 }
    );
  }
}
