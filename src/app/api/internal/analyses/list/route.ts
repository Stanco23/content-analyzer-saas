import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ success: false, error: { message: "User not found" } }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50");
  const id = searchParams.get("id");
  const groupByVersion = searchParams.get("group") === "true";

  // If ID is provided, fetch single analysis
  if (id) {
    const analysis = await prisma.analysis.findFirst({
      where: { id, userId: user.id },
    });
    return NextResponse.json({ success: true, data: analysis ? [analysis] : [] });
  }

  if (groupByVersion) {
    // Group analyses by version chain - get root analyses and their enhanced versions
    const rootAnalyses = await prisma.analysis.findMany({
      where: {
        userId: user.id,
        originalAnalysisId: null, // Root analyses (not enhanced from another)
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        enhancedAnalyses: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    // Also get orphaned enhanced analyses (that lost their root)
    const orphaned = await prisma.analysis.findMany({
      where: {
        userId: user.id,
        originalAnalysisId: { not: null },
      },
      orderBy: { createdAt: "desc" },
    });

    // Filter out orphaned that are already included
    const rootIds = new Set(rootAnalyses.map(a => a.id));
    const trulyOrphaned = orphaned.filter(a => !rootIds.has(a.originalAnalysisId!));

    // Combine
    const allGroups = rootAnalyses.map(root => ({
      root: root,
      versions: [root, ...root.enhancedAnalyses],
      versionCount: root.enhancedAnalyses.length + 1,
    }));

    // Add truly orphaned as single-item groups
    const orphanedGroups = trulyOrphaned.map(analysis => ({
      root: analysis,
      versions: [analysis],
      versionCount: 1,
    }));

    return NextResponse.json({
      success: true,
      data: [...allGroups, ...orphanedGroups],
      grouped: true,
    });
  }

  // Regular flat list
  const analyses = await prisma.analysis.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ success: true, data: analyses, grouped: false });
}
