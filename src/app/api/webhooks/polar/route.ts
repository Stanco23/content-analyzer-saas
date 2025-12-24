import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db/prisma';
import { TIER_TO_PRODUCT } from '@/lib/polar';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('polar-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  // Verify webhook signature
  const secret = process.env.POLAR_WEBHOOK_SECRET!;
  const expectedSig = crypto.createHmac('sha256', secret).update(body).digest('hex');

  if (signature !== expectedSig) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(body);
  const eventType = event.event_type;

  try {
    switch (eventType) {
      case 'checkout.session.completed': {
        const { customer_id, customer_email, subscription_id } = event.data;

        // Create or update customer record
        if (customer_email) {
          await prisma.user.updateMany({
            where: { email: customer_email },
            data: { polarCustomerId: customer_id },
          });
        }

        break;
      }

      case 'subscription.created':
      case 'subscription.activated': {
        const { customer_id, id: subscriptionId, product_id } = event.data;
        const tier = Object.keys(TIER_TO_PRODUCT).find(
          key => TIER_TO_PRODUCT[key as keyof typeof TIER_TO_PRODUCT] === product_id
        ) || 'FREE';

        await prisma.user.updateMany({
          where: { polarCustomerId: customer_id },
          data: {
            subscriptionTier: tier as any,
            subscriptionStatus: 'ACTIVE',
            polarSubscriptionId: subscriptionId,
          },
        });
        break;
      }

      case 'subscription.updated': {
        const { customer_id, status, product_id } = event.data;
        const tier = Object.keys(TIER_TO_PRODUCT).find(
          key => TIER_TO_PRODUCT[key as keyof typeof TIER_TO_PRODUCT] === product_id
        ) || 'FREE';

        const statusMap: Record<string, string> = {
          active: 'ACTIVE',
          inactive: 'INACTIVE',
          canceled: 'CANCELLED',
          past_due: 'PAST_DUE',
          trialing: 'TRIALING',
        };

        await prisma.user.updateMany({
          where: { polarCustomerId: customer_id },
          data: {
            subscriptionTier: tier as any,
            subscriptionStatus: (statusMap[status] || 'INACTIVE') as any,
          },
        });
        break;
      }

      case 'subscription.canceled': {
        const { customer_id } = event.data;
        await prisma.user.updateMany({
          where: { polarCustomerId: customer_id },
          data: {
            subscriptionTier: 'FREE',
            subscriptionStatus: 'CANCELLED',
          },
        });
        break;
      }

      case 'customer.created': {
        const { id: customerId, email } = event.data;
        await prisma.user.updateMany({
          where: { email },
          data: { polarCustomerId: customerId },
        });
        break;
      }

      case 'benefit.granted': {
        // Handle benefit grants if needed
        break;
      }

      case 'refund.completed': {
        // Handle refunds if needed
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Polar webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
