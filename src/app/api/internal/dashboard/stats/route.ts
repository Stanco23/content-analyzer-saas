import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ success: false, error: { message: "User not found" } }, { status: 404 });

  const [analysesCount, apiKeysCount] = await Promise.all([
    prisma.analysis.count({ where: { userId: user.id } }),
    prisma.apiKey.count({ where: { userId: user.id, isActive: true } }),
  ]);

  const stats = {
    analysesCount,
    apiKeysCount,
    monthlyUsage: user.monthlyAnalysesUsed,
    subscriptionTier: user.subscriptionTier,
  };

  return NextResponse.json({ success: true, data: stats });
}
