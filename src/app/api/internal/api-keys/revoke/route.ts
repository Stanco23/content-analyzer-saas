import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { revokeApiKey } from "@/lib/api/auth";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ success: false, error: { message: "User not found" } }, { status: 404 });

  const { keyId, reason } = await request.json();

  const apiKey = await prisma.apiKey.findFirst({ where: { id: keyId, userId: user.id } });
  if (!apiKey) return NextResponse.json({ success: false, error: { message: "API key not found" } }, { status: 404 });

  await revokeApiKey(keyId, reason);

  return NextResponse.json({ success: true });
}
