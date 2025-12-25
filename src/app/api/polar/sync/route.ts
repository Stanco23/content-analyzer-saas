import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';

function tierFromProductId(productId: string): string | null {
  const env = process.env;
  if (productId === env.POLAR_PRODUCT_PRO_MONTHLY) return 'PRO';
  if (productId === env.POLAR_PRODUCT_BUSINESS_MONTHLY) return 'BUSINESS';
  if (productId === env.POLAR_PRODUCT_PRO_ANNUAL) return 'PRO';
  if (productId === env.POLAR_PRODUCT_BUSINESS_ANNUAL) return 'BUSINESS';
  if (productId === env.POLAR_PRODUCT_API_STARTER) return 'API_STARTER';
  if (productId === env.POLAR_PRODUCT_API_GROWTH) return 'API_GROWTH';
  if (productId === env.POLAR_PRODUCT_API_GROWTH_ANNUAL) return 'API_GROWTH';
  if (productId === env.POLAR_PRODUCT_API_ENTERPRISE) return 'API_ENTERPRISE';
  return null;
}

function statusFromSubscriptionStatus(status: string): 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'TRIALING' {
  switch (status) {
    case 'active': return 'ACTIVE';
    case 'trialing': return 'TRIALING';
    case 'past_due': return 'PAST_DUE';
    case 'canceled': return 'CANCELLED';
    case 'inactive': return 'INACTIVE';
    default: return 'INACTIVE';
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log(`Sync request for user ${user.id}, polarCustomerId: ${user.polarCustomerId}, email: ${user.email}`);

    // If user has a Polar customer ID, fetch their subscription
    if (user.polarCustomerId) {
      console.log(`Fetching subscription for customer ${user.polarCustomerId}`);
      const response = await fetch(`${process.env.POLAR_API_URL || 'https://api.polar.sh/v1'}/subscriptions?customer_id=${user.polarCustomerId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.POLAR_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(`Polar subscriptions response status: ${response.status}`);

      if (response.ok) {
        const data = await response.json();
        const subscriptions = data.items || [];
        console.log(`Found ${subscriptions.length} subscriptions`);

        if (subscriptions.length > 0) {
          const activeSub = subscriptions.find((s: any) => s.status === 'active' || s.status === 'trialing') || subscriptions[0];
          console.log(`Using subscription ${activeSub.id}, product_id: ${activeSub.product_id}, status: ${activeSub.status}`);

          const tier = tierFromProductId(activeSub.product_id);
          if (tier) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                subscriptionTier: tier as any,
                subscriptionStatus: statusFromSubscriptionStatus(activeSub.status),
                polarSubscriptionId: activeSub.id,
              },
            });

            console.log(`Synced subscription for user ${user.id}: ${tier} (${activeSub.status})`);
            return NextResponse.json({
              success: true,
              tier,
              status: activeSub.status,
              currentPeriodEnd: activeSub.current_period_end,
            });
          } else {
            console.log(`Unknown product ID: ${activeSub.product_id}`);
            return NextResponse.json({
              success: false,
              error: 'Unknown product',
              productId: activeSub.product_id,
            }, { status: 400 });
          }
        }
      } else {
        const error = await response.text();
        console.error(`Polar API error: ${response.status} ${error}`);
      }
    } else {
      // No polarCustomerId - try to find customer by email
      console.log(`No polarCustomerId, searching for customer by email: ${user.email}`);
      const response = await fetch(`${process.env.POLAR_API_URL || 'https://api.polar.sh/v1'}/customers?email=${encodeURIComponent(user.email)}`, {
        headers: {
          'Authorization': `Bearer ${process.env.POLAR_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(`Polar customers response status: ${response.status}`);

      if (response.ok) {
        const data = await response.json();
        const customers = data.items || [];
        console.log(`Found ${customers.length} customers`);

        if (customers.length > 0) {
          const customer = customers[0];
          console.log(`Found customer ${customer.id}, linking to user`);

          // Update user with polarCustomerId
          await prisma.user.update({
            where: { id: user.id },
            data: { polarCustomerId: customer.id },
          });

          // Now try to fetch subscription
          const subResponse = await fetch(`${process.env.POLAR_API_URL || 'https://api.polar.sh/v1'}/subscriptions?customer_id=${customer.id}`, {
            headers: {
              'Authorization': `Bearer ${process.env.POLAR_API_KEY}`,
              'Content-Type': 'application/json',
            },
          });

          if (subResponse.ok) {
            const subData = await subResponse.json();
            const subscriptions = subData.items || [];

            if (subscriptions.length > 0) {
              const activeSub = subscriptions.find((s: any) => s.status === 'active' || s.status === 'trialing') || subscriptions[0];
              const tier = tierFromProductId(activeSub.product_id);

              if (tier) {
                await prisma.user.update({
                  where: { id: user.id },
                  data: {
                    subscriptionTier: tier as any,
                    subscriptionStatus: statusFromSubscriptionStatus(activeSub.status),
                    polarSubscriptionId: activeSub.id,
                  },
                });

                console.log(`Synced subscription for user ${user.id}: ${tier}`);
                return NextResponse.json({
                  success: true,
                  tier,
                  status: activeSub.status,
                  foundViaEmail: true,
                });
              }
            }
          }

          return NextResponse.json({
            success: true,
            foundViaEmail: true,
            message: 'Customer found, but no active subscription',
            polarCustomerId: customer.id,
          });
        }
      }

      return NextResponse.json({
        success: false,
        error: 'No Polar customer found',
        message: 'Please complete checkout again or contact support',
        polarCustomerId: null,
      }, { status: 404 });
    }

    // Return current status if no subscription found
    return NextResponse.json({
      success: true,
      tier: user.subscriptionTier,
      status: user.subscriptionStatus,
      polarCustomerId: user.polarCustomerId,
      message: 'No active subscription found in Polar',
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync subscription', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
