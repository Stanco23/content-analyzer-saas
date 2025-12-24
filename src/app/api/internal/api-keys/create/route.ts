import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { generateApiKey } from "@/lib/api/auth";

const createSchema = z.object({
  name: z.string().min(1).max(100),
  tier: z.enum(["STARTER", "GROWTH", "ENTERPRISE"]),
  environment: z.enum(["PRODUCTION", "TESTING"]),
});

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ success: false, error: { message: "User not found" } }, { status: 404 });

  const body = await request.json();
  const validation = createSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ success: false, error: { message: validation.error.issues[0].message } }, { status: 400 });
  }

  const { name, tier, environment } = validation.data;
  const result = await generateApiKey(user.id, name, tier, environment);

  return NextResponse.json({ success: true, data: result });
}
