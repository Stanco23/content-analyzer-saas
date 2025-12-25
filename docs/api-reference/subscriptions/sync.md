# Sync Subscription

Fetches the user's current subscription status from Polar. Use this to sync subscription data after checkout completion or when webhooks are not configured.

---

**Endpoint:** `POST /v1/subscriptions/sync`
**Base URL:** `https://api.contentlens.dev`

> For local development: `POST /api/polar/sync`

---

## Authorization

**Authentication:** Required (Clerk JWT)
**Header:** `Authorization: Bearer <your-jwt-token>`

---

## Request Body

Empty - no parameters required.

---

### Example Request

```bash
curl -X POST "https://api.contentlens.dev/v1/subscriptions/sync" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## Response

### 200 OK - Success

```json
{
  "success": true,
  "tier": "PRO",
  "status": "active",
  "polarCustomerId": "cust_abc123",
  "polarSubscriptionId": "sub_xyz789",
  "currentPeriodEnd": "2024-02-15T00:00:00Z"
}
```

### 200 OK - No Subscription Found

```json
{
  "success": true,
  "tier": "FREE",
  "status": "inactive",
  "polarCustomerId": null,
  "message": "No active subscription found in Polar"
}
```

---

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `tier` | string | Subscription tier (FREE, PRO, BUSINESS, API_STARTER, API_GROWTH, API_ENTERPRISE) |
| `status` | string | Subscription status (ACTIVE, INACTIVE, CANCELLED, PAST_DUE, TRIALING) |
| `polarCustomerId` | string \| null | Polar customer ID |
| `polarSubscriptionId` | string \| null | Polar subscription ID |
| `currentPeriodEnd` | datetime \| null | End of current billing period |

---

## When to Use This Endpoint

1. **After Checkout**: Sync subscription after successful checkout
2. **On Login**: Ensure subscription is up-to-date on app load
3. **After Webhook Failure**: Fallback when webhooks don't work (e.g., localhost)
4. **Manual Refresh**: Allow users to manually refresh their status

---

## Code Examples

### JavaScript/TypeScript

```typescript
interface SubscriptionStatus {
  tier: string;
  status: string;
  polarCustomerId: string | null;
  polarSubscriptionId: string | null;
}

async function syncSubscription(): Promise<SubscriptionStatus> {
  const response = await fetch(
    "https://api.contentlens.dev/v1/subscriptions/sync",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${await getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    }
  );

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error.message);
  }

  return {
    tier: result.tier,
    status: result.status,
    polarCustomerId: result.polarCustomerId,
    polarSubscriptionId: result.polarSubscriptionId,
  };
}

// Usage
const subscription = await syncSubscription();
console.log(`Current plan: ${subscription.tier}`);
console.log(`Status: ${subscription.status}`);
```

### Python

```python
import requests

def sync_subscription():
    response = requests.post(
        "https://api.contentlens.dev/v1/subscriptions/sync",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        json={}
    )

    result = response.json()
    if not result["success"]:
        raise Exception(result["error"]["message"])

    return result

# Usage
subscription = sync_subscription()
print(f"Current plan: {subscription['tier']}")
print(f"Status: {subscription['status']}")
```

---

## See Also

- [Create Checkout](/docs/api-reference/subscriptions/checkout) - Purchase subscription
- [Customer Portal](/docs/api-reference/subscriptions/portal) - Manage subscription
- [Trial Endpoint](/docs/api-reference/subscriptions/trial) - Start free trial
