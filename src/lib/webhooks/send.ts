import { prisma } from '@/lib/db/prisma';
import { generateWebhookSignature } from './verify';

interface WebhookPayload {
  event: string;
  data: any;
  timestamp: number;
  [key: string]: string | number | any;
}

export async function sendWebhook(
  webhook: { id: string; url: string; secret: string },
  event: string,
  data: any
): Promise<void> {
  const timestamp = Math.floor(Date.now() / 1000);
  const payload: WebhookPayload = { event, data, timestamp };
  const signature = generateWebhookSignature(payload, webhook.secret, timestamp);

  let attemptNumber = 1;
  const maxAttempts = 3;

  while (attemptNumber <= maxAttempts) {
    const startTime = Date.now();

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Timestamp': timestamp.toString(),
          'X-Webhook-Event': event,
          'User-Agent': 'ContentAnalyzer-Webhooks/1.0',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000),
      });

      const responseTime = Date.now() - startTime;
      const responseBody = await response.text().catch(() => '');

      await prisma.webhookDelivery.create({
        data: {
          webhookEndpointId: webhook.id,
          eventType: event,
          payload,
          statusCode: response.status,
          responseBody: responseBody.substring(0, 1000),
          responseTimeMs: responseTime,
          attemptNumber,
          success: response.ok,
          deliveredAt: new Date(),
        },
      });

      if (response.ok) {
        await prisma.webhookEndpoint.update({
          where: { id: webhook.id },
          data: { lastSuccessAt: new Date(), failureCount: 0 },
        });
        return;
      }

      attemptNumber++;
      if (attemptNumber <= maxAttempts) {
        await delay(Math.pow(2, attemptNumber) * 1000);
      }
    } catch (error: any) {
      await prisma.webhookDelivery.create({
        data: {
          webhookEndpointId: webhook.id,
          eventType: event,
          payload,
          attemptNumber,
          success: false,
          errorMessage: error.message,
        },
      });

      attemptNumber++;
      if (attemptNumber <= maxAttempts) {
        await delay(Math.pow(2, attemptNumber) * 1000);
      }
    }
  }

  await prisma.webhookEndpoint.update({
    where: { id: webhook.id },
    data: {
      lastFailureAt: new Date(),
      failureCount: { increment: 1 },
    },
  });
}

export async function triggerWebhooks(
  userId: string,
  event: string,
  data: any
): Promise<void> {
  const webhooks = await prisma.webhookEndpoint.findMany({
    where: {
      userId,
      isActive: true,
      events: { has: event },
    },
  });

  for (const webhook of webhooks) {
    sendWebhook(webhook, event, data).catch(console.error);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
