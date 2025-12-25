import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import Anthropic from '@anthropic-ai/sdk';
import { analyzeContent } from '@/lib/ai/minimax';

const enhanceSchema = z.object({
  analysisId: z.string().optional(),
  content: z.string().min(50, "Content must be at least 50 characters").max(50000),
  title: z.string().optional(),
  options: z.object({
    tone: z.enum(['professional', 'casual', 'academic', 'persuasive']).default('professional'),
    goal: z.enum(['improve', 'simplify', 'expand', 'formal', 'casual', 'persuasive', 'seo']).default('improve'),
    reAnalyze: z.boolean().default(true),
  }).optional(),
});

// Tier limits
const TIER_LIMITS = {
  FREE: 5,
  PRO: 500,
  BUSINESS: 2000,
  API_STARTER: 0,
  API_GROWTH: 0,
  API_ENTERPRISE: 0,
};

// Initialize Anthropic/MiniMax client
const client = new Anthropic({
  apiKey: process.env.MINIMAX_API_KEY!,
  baseURL: 'https://api.minimax.io/anthropic',
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

    // Check monthly limit (enhancements count as analyses)
    const limit = TIER_LIMITS[user.subscriptionTier as keyof typeof TIER_LIMITS] || TIER_LIMITS.FREE;

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
            message: `Monthly limit of ${limit} enhancements reached. Please upgrade your plan.`,
          },
        },
        { status: 402 }
      );
    }

    const body = await request.json();
    const validation = enhanceSchema.safeParse(body);

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

    const { analysisId, content, title, options } = validation.data;

    // Provide defaults for optional options
    const tone = options?.tone || 'professional';
    const goal = options?.goal || 'improve';
    const reAnalyze = options?.reAnalyze !== false;

    // Build enhancement prompt
    const goalInstructions = {
      improve: "Improve the overall quality, clarity, grammar, and engagement of this content while maintaining the original meaning.",
      simplify: "Simplify the language to make it more accessible, easier to understand, and clearer for a broader audience.",
      expand: "Expand the content with more details, examples, supporting information, and depth while maintaining the original message.",
      formal: "Transform the content to be more formal, professional, and suitable for business or academic contexts.",
      casual: "Transform the content to be more conversational, friendly, and engaging in a casual tone.",
      persuasive: "Strengthen the content to be more compelling, persuasive, and actionable for the reader.",
      seo: "Optimize the content for search engines by naturally integrating relevant keywords while maintaining excellent readability.",
    };

    const enhancementPrompt = `You are an expert content editor. Your task is to rewrite/enhance the following content.

Instructions:
- ${goalInstructions[goal]}
- Tone: ${tone}
- Respond ONLY with the enhanced content, no explanations, no markdown formatting, no "Here is the enhanced version" text
- Start directly with the content

Content to enhance:
${content}`;

    // Call MiniMax API for real enhancement
    const message = await client.messages.create({
      model: 'MiniMax-M2.1',
      max_tokens: 16384,
      messages: [
        { role: 'user', content: enhancementPrompt },
      ],
    });

    // Extract text from response
    const textBlock = message.content.find(block => block.type === 'text');
    const enhancedContent = textBlock?.type === 'text' ? textBlock.text : content;

    if (!enhancedContent || enhancedContent.trim() === content.trim()) {
      // If no meaningful change, return original
      return NextResponse.json({
        success: true,
        data: {
          enhanced_content: content,
          no_changes: true,
          message: "Content could not be improved with the selected options",
        },
      });
    }

    // Calculate token usage
    const tokensUsed = message.usage ? message.usage.input_tokens + message.usage.output_tokens : 0;

    // Run analysis on enhanced content if requested
    let analysisData = null;
    if (reAnalyze) {
      try {
        analysisData = await analyzeContent({
          content: enhancedContent,
          title: title || 'Enhanced Content',
        });
      } catch (analysisError) {
        console.error('Enhanced content analysis failed:', analysisError);
        // Continue without analysis data
      }
    }

    // Create new analysis record for the enhanced version
    const savedAnalysis = await prisma.analysis.create({
      data: {
        userId: user.id,
        title: title || 'Enhanced Content',
        content: enhancedContent,
        wordCount: enhancedContent.split(/\s+/).filter(Boolean).length,
        isEnhanced: true,
        originalAnalysisId: analysisId || null,
        tokensUsed,
        // Analysis scores from re-analysis
        readabilityScore: analysisData?.readabilityScore || null,
        seoScore: analysisData?.seoScore || null,
        grammarScore: analysisData?.grammarScore || null,
        accessibilityScore: analysisData?.accessibilityScore || null,
        engagementScore: analysisData?.engagementScore || null,
        originalityScore: analysisData?.originalityScore || null,
        sentimentScore: analysisData?.sentimentScore || null,
        sourceRelevanceScore: analysisData?.sourceRelevanceScore || null,
        keywordDensity: analysisData?.keywordDensity || null,
        processingTimeMs: analysisData?.processing_time_ms || null,
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
        id: savedAnalysis.id,
        enhanced_content: enhancedContent,
        original_length: content.length,
        enhanced_length: enhancedContent.length,
        improvement_percentage: Math.round((enhancedContent.length - content.length) / content.length * 100),
        tokens_used: tokensUsed,
        // Analysis results
        analysis: analysisData ? {
          readabilityScore: analysisData.readabilityScore,
          seoScore: analysisData.seoScore,
          grammarScore: analysisData.grammarScore,
          engagementScore: analysisData.engagementScore,
        } : null,
      },
      usage: {
        used: user.monthlyAnalysesUsed + 1,
        limit,
        remaining: limit - user.monthlyAnalysesUsed - 1,
      },
    });
  } catch (error: any) {
    console.error("Enhancement error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error.message || "Enhancement failed",
        },
      },
      { status: 500 }
    );
  }
}
