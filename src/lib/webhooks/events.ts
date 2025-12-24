export const WEBHOOK_EVENTS = {
  'analysis.completed': 'Triggered when an analysis completes successfully',
  'analysis.failed': 'Triggered when an analysis fails',
  'quota.warning': 'Triggered when 80% of quota is used',
  'quota.exceeded': 'Triggered when quota is exceeded',
  'api_key.created': 'Triggered when a new API key is created',
  'api_key.revoked': 'Triggered when an API key is revoked',
} as const;

export type WebhookEvent = keyof typeof WEBHOOK_EVENTS;

export function isValidWebhookEvent(event: string): event is WebhookEvent {
  return event in WEBHOOK_EVENTS;
}
