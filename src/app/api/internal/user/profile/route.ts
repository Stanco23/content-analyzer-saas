import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

async function syncSubscriptionFromPolar(polarCustomerId: string): Promise<{ tier: string | null; status: string | null }> {
  try {
    const response = await fetch(
      `${process.env.POLAR_API_URL || 'https://api.polar.sh/v1'}/subscriptions?customer_id=${polarCustomerId}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.POLAR_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      const subscriptions = data.items || [];

      if (subscriptions.length > 0) {
        const activeSub = subscriptions.find((s: any) => s.status === 'active' || s.status === 'trialing') || subscriptions[0];

        // Map product ID to tier
        const env = process.env;
        let tier: string | null = null;
        if (activeSub.product_id === env.POLAR_PRODUCT_PRO_MONTHLY || activeSub.product_id === env.POLAR_PRODUCT_PRO_ANNUAL) {
          tier = 'PRO';
        } else if (activeSub.product_id === env.POLAR_PRODUCT_BUSINESS_MONTHLY || activeSub.product_id === env.POLAR_PRODUCT_BUSINESS_ANNUAL) {
          tier = 'BUSINESS';
        } else if (activeSub.product_id === env.POLAR_PRODUCT_API_STARTER) {
          tier = 'API_STARTER';
        } else if (activeSub.product_id === env.POLAR_PRODUCT_API_GROWTH || activeSub.product_id === env.POLAR_PRODUCT_API_GROWTH_ANNUAL) {
          tier = 'API_GROWTH';
        } else if (activeSub.product_id === env.POLAR_PRODUCT_API_ENTERPRISE) {
          tier = 'API_ENTERPRISE';
        }

        if (tier) {
          const statusMap: Record<string, 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'TRIALING'> = {
            'active': 'ACTIVE',
            'trialing': 'TRIALING',
            'past_due': 'PAST_DUE',
            'canceled': 'CANCELLED',
            'inactive': 'INACTIVE',
          };

          // Find user by polarCustomerId first (since it's not a unique identifier)
          const userToUpdate = await prisma.user.findFirst({
            where: { polarCustomerId },
          });

          if (userToUpdate) {
            await prisma.user.update({
              where: { id: userToUpdate.id },
              data: {
                subscriptionTier: tier as any,
                subscriptionStatus: statusMap[activeSub.status] || 'INACTIVE',
                polarSubscriptionId: activeSub.id,
              },
            });

            console.log(`Synced subscription for customer ${polarCustomerId}: ${tier} (${activeSub.status})`);
            return { tier, status: activeSub.status };
          }
        }
      }
    }
  } catch (error) {
    console.error('Error syncing subscription from Polar:', error);
  }
  return { tier: null, status: null };
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ success: false, error: { message: "User not found" } }, { status: 404 });

  // Sync subscription from Polar if user has a Polar customer ID
  if (user.polarCustomerId && user.subscriptionTier === 'FREE') {
    const { tier, status } = await syncSubscriptionFromPolar(user.polarCustomerId);
    if (tier) {
      // Refetch user with updated data
      const updatedUser = await prisma.user.findUnique({ where: { clerkId: userId } });
      if (updatedUser) {
        user.subscriptionTier = updatedUser.subscriptionTier;
        user.subscriptionStatus = updatedUser.subscriptionStatus;
      }
    }
  }

  const userData = {
    subscriptionTier: user.subscriptionTier,
    subscriptionStatus: user.subscriptionStatus,
    monthlyAnalysesUsed: user.monthlyAnalysesUsed,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    polarCustomerId: user.polarCustomerId,
    polarSubscriptionId: user.polarSubscriptionId,
  };

  return NextResponse.json({ success: true, data: userData });
}
