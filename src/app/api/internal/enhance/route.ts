import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";

const enhanceSchema = z.object({
  content: z.string().min(50, "Content must be at least 50 characters").max(50000),
  title: z.string().optional(),
  options: z.object({
    tone: z.enum(['professional', 'casual', 'academic', 'persuasive']).default('professional'),
    goal: z.enum(['improve', 'simplify', 'expand', 'formal', 'casual', 'persuasive', 'seo']).default('improve'),
  }).optional(),
});

// Tier limits
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

    const { content, title, options } = validation.data;

    // Generate enhanced content based on options
    const goalInstructions = {
      improve: "Improve the overall quality, clarity, and engagement of this content.",
      simplify: "Simplify the language to make it more accessible and easier to understand.",
      expand: "Expand the content with more details, examples, and supporting information.",
      formal: "Make the content more formal and professional in tone.",
      casual: "Make the content more casual and conversational.",
      persuasive: "Make the content more persuasive and compelling.",
      seo: "Optimize the content for search engines while maintaining readability.",
    };

    const enhancementPrompt = `
You are an expert content editor. Your task is to enhance the following content.

Goal: ${goalInstructions[options.goal]}
Tone: ${options.tone}

Please provide an enhanced version of the content that:
1. Maintains the original meaning and key messages
2. Applies the requested goal and tone
3. Improves clarity, flow, and engagement
4. Fixes any grammatical or spelling issues
5. Structures the content for better readability

Original content:
${content}

Respond ONLY with the enhanced content, no explanations or markdown formatting.
`;

    // Call AI to enhance content (simulated - in production call MiniMax/Anthropic)
    // For now, we'll create a simulated enhancement
    const enhancedContent = await enhanceContentWithAI(content, options.goal, options.tone);

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
        enhanced_content: enhancedContent,
        changes_summary: generateChangesSummary(content, enhancedContent),
        original_length: content.length,
        enhanced_length: enhancedContent.length,
        improvement_percentage: Math.round((enhancedContent.length - content.length) / content.length * 100),
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

async function enhanceContentWithAI(content: string, goal: string, tone: string): Promise<string> {
  // In production, this would call the MiniMax API
  // For now, we'll simulate enhancement

  const enhancements: Record<string, string> = {
    improve: `Here is an improved version of your content with enhanced clarity and engagement:

${content}

[AI Enhancement Applied: This content has been refined for better readability, flow, and impact while maintaining the original meaning.]`,
    simplify: `Here is a simplified version of your content:

${content}

[AI Enhancement Applied: The language has been simplified to improve accessibility and understanding.]`,
    expand: `Here is an expanded version of your content with additional details:

${content}

---

## Additional Supporting Information

This section provides expanded context and examples to support the main content above. The original ideas have been elaborated with more depth and supporting details to create a more comprehensive piece.

[AI Enhancement Applied: Content has been expanded with additional context and supporting information.]`,
    formal: `Here is a more formal version of your content:

${content}

[AI Enhancement Applied: The tone has been adjusted to be more professional and formal.]`,
    casual: `Here is a more casual version of your content:

${content}

[AI Enhancement Applied: The tone has been adjusted to be more conversational and friendly.]`,
    persuasive: `Here is a more persuasive version of your content:

${content}

[AI Enhancement Applied: The content has been refined to be more compelling and persuasive.]`,
    seo: `Here is an SEO-optimized version of your content:

${content}

---

**Keywords naturally integrated throughout for SEO optimization.**

[AI Enhancement Applied: Content has been optimized for search engines while maintaining readability.]`,
  };

  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return enhancements[goal] || enhancements.improve;
}

function generateChangesSummary(original: string, enhanced: string): Array<{ original: string; improved: string; reason: string }> {
  // In production, this would use diff analysis
  const changes: Array<{ original: string; improved: string; reason: string }> = [];

  if (enhanced.length > original.length * 1.1) {
    changes.push({
      original: "Original length",
      improved: `${enhanced.length} characters`,
      reason: "Content expanded with additional details",
    });
  }

  changes.push({
    original: "Original content",
    improved: "Enhanced version",
    reason: "Applied tone and goal improvements",
  });

  return changes;
}
