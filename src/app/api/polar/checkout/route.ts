import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { polar, TIER_TO_PRODUCT } from '@/lib/polar';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tier } = await request.json() as { tier?: string };

    if (!tier || !TIER_TO_PRODUCT[tier as keyof typeof TIER_TO_PRODUCT]) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const productId = TIER_TO_PRODUCT[tier as keyof typeof TIER_TO_PRODUCT];

    if (!productId) {
      return NextResponse.json({ error: 'Invalid tier configuration' }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create checkout session with metadata for webhook processing
    const checkout = await polar.createCheckoutSession({
      customer_id: user.polarCustomerId || undefined,
      customer_email: user.email,
      product_id: productId,
      success_url: `${appUrl}/dashboard?checkout=success`,
      cancel_url: `${appUrl}/dashboard?checkout=cancelled`,
    });

    return NextResponse.json({ success: true, checkoutUrl: checkout.url });
  } catch (error) {
    console.error('Checkout error:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
