import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db/prisma';
import { Webhook } from 'svix';

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
  };
}

function tierFromProductId(productId: string): string | null {
  const env = process.env;
  if (productId === env.POLAR_PRODUCT_PRO) return 'PRO';
  if (productId === env.POLAR_PRODUCT_BUSINESS) return 'BUSINESS';
  if (productId === env.POLAR_PRODUCT_API_STARTER) return 'API_STARTER';
  if (productId === env.POLAR_PRODUCT_API_GROWTH) return 'API_GROWTH';
  if (productId === env.POLAR_PRODUCT_API_ENTERPRISE) return 'API_ENTERPRISE';
  return null;
}

function statusToSubscriptionStatus(status: string): 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'TRIALING' {
  switch (status) {
    case 'active':
      return 'ACTIVE';
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

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('POLAR_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  // Get headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Missing Svix headers');
    return NextResponse.json({ error: 'Missing webhook headers' }, { status: 400 });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create Svix webhook instance
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: any;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const eventType = evt.type;
  const data = evt.data;

  console.log(`Processing Polar webhook: ${eventType}`);

  try {
    switch (eventType) {
      case 'checkout.updated': {
        // Check if checkout was successful (paid)
        if (data.status === 'paid') {
          // Find user by email (Polar sends customer email in checkout)
          const user = await prisma.user.findFirst({
            where: { email: data.customer_email },
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
        const subData = data as PolarWebhookPayload;
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
        const subData = data as PolarWebhookPayload;
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
        const subData = data as PolarWebhookPayload;
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
        const subData = data as PolarWebhookPayload;
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
        const customerData = data as PolarWebhookPayload;
        // Store customer ID for user if email matches
        const user = await prisma.user.findFirst({
          where: { email: (customerData as any).email },
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
