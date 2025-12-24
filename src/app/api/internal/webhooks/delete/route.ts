import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ success: false }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ success: false }, { status: 404 });

  const { id } = await request.json();

  await prisma.webhookEndpoint.deleteMany({
    where: { id, userId: user.id },
  });

  return NextResponse.json({ success: true });
}
