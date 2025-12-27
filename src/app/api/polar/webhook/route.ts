import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import crypto from 'crypto';

interface PolarWebhookPayload {
  event_id: string;
  event_type: string;
  created_at: string;
  data: {
    id: string;
    status: string;
    customer_id: string;
    product_id: string;
    current_period_start: string;
    current_period_end: string;
    canceled_at: string | null;
    ended_at: string | null;
    customer_email?: string;
    subscription_id?: string;
    email?: string;
  };
}

function tierFromProductId(productId: string): string | null {
  const env = process.env;
  // Monthly products
  if (productId === env.POLAR_PRODUCT_PRO_MONTHLY) return 'PRO';
  if (productId === env.POLAR_PRODUCT_BUSINESS_MONTHLY) return 'BUSINESS';
  // Annual products
  if (productId === env.POLAR_PRODUCT_PRO_ANNUAL) return 'PRO';
  if (productId === env.POLAR_PRODUCT_BUSINESS_ANNUAL) return 'BUSINESS';
  // API products
  if (productId === env.POLAR_PRODUCT_API_STARTER) return 'API_STARTER';
  if (productId === env.POLAR_PRODUCT_API_GROWTH) return 'API_GROWTH';
  if (productId === env.POLAR_PRODUCT_API_GROWTH_ANNUAL) return 'API_GROWTH';
  if (productId === env.POLAR_PRODUCT_API_ENTERPRISE) return 'API_ENTERPRISE';
  return null;
}

function statusToSubscriptionStatus(status: string): 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'TRIALING' {
  switch (status) {
    case 'active':
      return 'ACTIVE';
    case 'trialing':
      return 'TRIALING';
    case 'inactive':
      return 'INACTIVE';
    case 'canceled':
      return 'CANCELLED';
    case 'past_due':
      return 'PAST_DUE';
    default:
      return 'INACTIVE';
  }
}

function verifyPolarSignature(payload: string, signature: string, secret: string): boolean {
  try {
    // Polar signature format: t={timestamp},v1={signature}
    const parts = signature.split(',');
    const timestamp = parts[0]?.replace('t=', '');
    const sig = parts[1]?.replace('v1=', '');

    if (!timestamp || !sig) {
      return false;
    }

    // Create signed payload
    const signedPayload = `${timestamp}.${payload}`;

    // Compute expected signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');

    // Use timing-safe comparison
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSignature));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('POLAR_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  // Get raw body for signature verification
  const body = await req.text();
  const payload = JSON.parse(body);

  // Get Polar signature header
  const polarSignature = req.headers.get('polar-signature');

  if (!polarSignature) {
    console.error('Missing polar-signature header');
    return NextResponse.json({ error: 'Missing signature header' }, { status: 400 });
  }

  // Verify signature
  const isValid = verifyPolarSignature(body, polarSignature, WEBHOOK_SECRET);
  if (!isValid) {
    console.error('Invalid webhook signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const eventType = payload.event_type;
  const data = payload.data as PolarWebhookPayload['data'];

  console.log(`Processing Polar webhook: ${eventType}`, JSON.stringify(data, null, 2));

  try {
    switch (eventType) {
      case 'checkout.updated': {
        // Check if checkout was successful (paid)
        if (data.status === 'paid') {
          // Find user by email (Polar sends customer email in checkout)
          const user = await prisma.user.findFirst({
            where: { email: data.customer_email || data.email },
          });

          if (user) {
            const tier = tierFromProductId(data.product_id);
            if (tier) {
              await prisma.user.update({
                where: { id: user.id },
                data: {
                  subscriptionTier: tier as any,
                  subscriptionStatus: 'ACTIVE',
                  polarCustomerId: data.customer_id,
                },
              });
              console.log(`User ${user.id} activated ${tier} via checkout`);
            }
          }
        }
        break;
      }

      case 'subscription.created':
      case 'subscription.active': {
        const subData = data as any;
        const tier = tierFromProductId(subData.product_id);

        if (tier) {
          // Find user by Polar customer ID
          const user = await prisma.user.findFirst({
            where: { polarCustomerId: subData.customer_id },
          });

          if (user) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                subscriptionTier: tier as any,
                subscriptionStatus: statusToSubscriptionStatus(subData.status),
                polarSubscriptionId: subData.id,
              },
            });
            console.log(`User ${user.id} subscription ${eventType}: ${tier}`);
          } else {
            console.log(`No user found for customer_id: ${subData.customer_id}`);
          }
        }
        break;
      }

      case 'subscription.updated': {
        const subData = data as any;
        const tier = tierFromProductId(subData.product_id);

        if (tier) {
          const user = await prisma.user.findFirst({
            where: { polarCustomerId: subData.customer_id },
          });

          if (user) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                subscriptionTier: tier as any,
                subscriptionStatus: statusToSubscriptionStatus(subData.status),
                polarSubscriptionId: subData.id,
              },
            });
            console.log(`User ${user.id} subscription updated to ${subData.status}`);
          }
        }
        break;
      }

      case 'subscription.canceled':
      case 'subscription.revoked': {
        const subData = data as any;
        const user = await prisma.user.findFirst({
          where: { polarSubscriptionId: subData.id },
        });

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionStatus: 'CANCELLED',
            },
          });
          console.log(`User ${user.id} subscription canceled/revoked`);
        }
        break;
      }

      case 'subscription.past_due': {
        const subData = data as any;
        const user = await prisma.user.findFirst({
          where: { polarSubscriptionId: subData.id },
        });

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionStatus: 'PAST_DUE',
            },
          });
          console.log(`User ${user.id} subscription past due`);
        }
        break;
      }

      case 'customer.created': {
        const customerData = data as any;
        // Store customer ID for user if email matches
        const user = await prisma.user.findFirst({
          where: { email: customerData.email },
        });

        if (user && !user.polarCustomerId) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              polarCustomerId: customerData.id,
            },
          });
          console.log(`Linked user ${user.id} to Polar customer ${customerData.id}`);
        }
        break;
      }

      case 'order.paid': {
        // Payment successful - activate subscription
        const orderData = data as any;
        if (orderData.subscription_id) {
          const sub = await prisma.user.findFirst({
            where: { polarSubscriptionId: orderData.subscription_id },
          });
          if (sub) {
            await prisma.user.update({
              where: { id: sub.id },
              data: {
                subscriptionStatus: 'ACTIVE',
              },
            });
            console.log(`User ${sub.id} order paid, subscription active`);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled Polar event: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing Polar webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
