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

  const analyses = await prisma.analysis.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      wordCount: true,
      readabilityScore: true,
      seoScore: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ success: true, data: analyses });
}
