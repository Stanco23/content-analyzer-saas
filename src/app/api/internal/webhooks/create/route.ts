import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { generateWebhookSecret } from "@/lib/webhooks/verify";

const schema = z.object({
  url: z.string().url(),
  description: z.string().optional(),
  events: z.array(z.string()).min(1),
});

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ success: false }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ success: false }, { status: 404 });

  const body = await request.json();
  const validation = schema.safeParse(body);
  if (!validation.success) return NextResponse.json({ success: false, error: { message: validation.error.issues[0].message } }, { status: 400 });

  const webhook = await prisma.webhookEndpoint.create({
    data: {
      userId: user.id,
      url: validation.data.url,
      description: validation.data.description,
      events: validation.data.events,
      secret: generateWebhookSecret(),
    },
  });

  return NextResponse.json({ success: true, data: webhook });
}
