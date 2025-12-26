import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db/prisma';
import { polar } from '@/lib/polar';

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.polarCustomerId) {
      return NextResponse.json({
        error: 'NO_CUSTOMER',
        message: 'You need an active subscription to access the customer portal. Please subscribe first.',
      }, { status: 400 });
    }

    console.log('Creating portal session for customer:', user.polarCustomerId);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create portal session
    const portal = await polar.createPortalSession(user.polarCustomerId, `${appUrl}/dashboard/settings`);

    console.log('Portal session created:', portal.url);

    return NextResponse.json({ success: true, portalUrl: portal.url });
  } catch (error) {
    console.error('Portal error:', error);
    const message = error instanceof Error ? error.message : String(error);

    // Check for common Polar errors
    if (message.includes('customer not found') || message.includes('404')) {
      return NextResponse.json(
        { error: 'CUSTOMER_NOT_FOUND', message: 'Your Polar customer account was not found. Please contact support.' },
        { status: 400 }
      );
    }

    if (message.includes('authentication') || message.includes('401') || message.includes('unauthorized')) {
      return NextResponse.json(
        { error: 'POLAR_API_ERROR', message: 'Payment provider configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'PORTAL_ERROR', message },
      { status: 500 }
    );
  }
}
