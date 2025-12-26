# Subscription Management

Manage subscriptions, checkouts, and trials using Polar's payment integration.

---

## Available Plans

| Plan | Monthly Price | Yearly Price | Analyses/Month |
|------|---------------|--------------|----------------|
| Free | $0 | $0 | 5 |
| Pro | $19 | $190/year | 500 |
| Business | $49 | $490/year | 2,000 |
| API Starter | $99 | $990/year | Unlimited |
| API Growth | $299 | $2,990/year | Unlimited |
| API Enterprise | Custom | Custom | Unlimited |

---

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| [Create Checkout](/api-reference/subscriptions/checkout) | `POST` | Create checkout session |
| [Customer Portal](/api-reference/subscriptions/portal) | `POST` | Manage subscription |
| [Sync Subscription](/api-reference/subscriptions/sync) | `POST` | Fetch latest subscription |
| [Trial](/api-reference/subscriptions/trial) | `GET/POST` | Start or check trial |

---

## Webhook Events

Subscribe to webhook events for real-time subscription updates:

| Event | Description |
|-------|-------------|
| `subscription.created` | New subscription created |
| `subscription.updated` | Subscription modified |
| `subscription.canceled` | Subscription canceled |
| `checkout.completed` | Checkout completed |
| `invoice.paid` | Invoice payment successful |

---

## See Also

- [Checkout Endpoint](/api-reference/subscriptions/checkout)
- [Customer Portal](/api-reference/subscriptions/portal)
- [Webhook Setup](/guides/webhooks)
