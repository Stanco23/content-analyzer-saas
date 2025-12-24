import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ success: false, error: { message: "User not found" } }, { status: 404 });

  const userData = {
    subscriptionTier: user.subscriptionTier,
    subscriptionStatus: user.subscriptionStatus,
    monthlyAnalysesUsed: user.monthlyAnalysesUsed,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  };

  return NextResponse.json({ success: true, data: userData });
}
