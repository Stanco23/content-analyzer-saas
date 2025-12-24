import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";

export async function getOrCreateUser() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  // Auto-create user record if it doesn't exist (e.g., webhook not configured yet)
  if (!user) {
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
    const name = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ') || null;

    user = await prisma.user.create({
      data: {
        clerkId: userId,
        email: email || `user_${userId}@example.com`,
        name,
        subscriptionTier: 'FREE',
        subscriptionStatus: 'INACTIVE',
      },
    });
  }

  return user;
}
