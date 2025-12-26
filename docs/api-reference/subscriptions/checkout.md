# Create Checkout Session

Creates a checkout session for purchasing a subscription plan.

---

**Endpoint:** `POST /v1/subscriptions/checkout`
**Base URL:** `https://api.contentlens.dev`

> For local development: `POST /api/polar/checkout`

---

## Authorization

**Authentication:** Required (Clerk JWT)
**Header:** `Authorization: Bearer <your-jwt-token>`

---

## Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `plan` | string | Yes | Plan identifier (see below) |
| `successUrl` | string | No | URL to redirect after success |
| `cancelUrl` | string | No | URL to redirect on cancel |

### Plan Identifiers

| Plan | Identifier |
|------|------------|
| Pro Monthly | `pro_monthly` |
| Pro Annual | `pro_annual` |
| Business Monthly | `business_monthly` |
| Business Annual | `business_annual` |
| API Starter | `api_starter` |
| API Growth | `api_growth` |
| API Enterprise | `api_enterprise` |

---

### Example Request

```bash
curl -X POST "https://api.contentlens.dev/v1/subscriptions/checkout" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "pro_monthly",
    "successUrl": "https://yourapp.com/success",
    "cancelUrl": "https://yourapp.com/cancel"
  }'
```

---

## Response

### 200 OK - Success

```json
{
  "success": true,
  "url": "https://checkout.polar.sh/checkout/abc123",
  "checkoutId": "abc123",
  "plan": "pro_monthly",
  "amount": 1900,
  "currency": "usd"
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "error": {
    "code": "INVALID_PLAN",
    "message": "Invalid plan identifier. Valid plans: pro_monthly, pro_annual, business_monthly, business_annual, api_starter, api_growth, api_enterprise"
  }
}
```

### 402 Payment Required (Already Subscribed)

```json
{
  "success": false,
  "error": {
    "code": "ALREADY_SUBSCRIBED",
    "message": "You already have an active subscription. Visit the customer portal to manage it."
  }
}
```

---

## Code Examples

### JavaScript/TypeScript

```typescript
interface CheckoutOptions {
  plan: "pro_monthly" | "pro_annual" | "business_monthly" | "business_annual" | "api_starter" | "api_growth" | "api_enterprise";
  successUrl?: string;
  cancelUrl?: string;
}

async function createCheckout(options: CheckoutOptions) {
  const response = await fetch(
    "https://api.contentlens.dev/v1/subscriptions/checkout",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${await getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options),
    }
  );

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result;
}

// Usage - Redirect user to checkout
const checkout = await createCheckout({
  plan: "pro_monthly",
  successUrl: `${window.location.origin}/subscription/success`,
});

window.location.href = checkout.url;
```

### Python

```python
import requests

def create_checkout(plan, success_url=None, cancel_url=None):
    response = requests.post(
        "https://api.contentlens.dev/v1/subscriptions/checkout",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        json={
            "plan": plan,
            "successUrl": success_url,
            "cancelUrl": cancel_url
        }
    )

    result = response.json()
    if not result["success"]:
        raise Exception(result["error"]["message"])

    return result

# Usage
checkout = create_checkout("pro_monthly")
print(f"Checkout URL: {checkout['url']}")
```

---

## Checkout Flow

1. Call this endpoint to create a checkout session
2. Redirect the user to the returned `url`
3. User completes payment on Polar's secure checkout page
4. On success, user is redirected to `successUrl`
5. Webhook fires to update user's subscription status

---

## See Also

- [Customer Portal](/docs/api-reference/subscriptions/portal) - Manage existing subscription
- [Sync Subscription](/docs/api-reference/subscriptions/sync) - Update subscription status
- [Trial Endpoint](/docs/api-reference/subscriptions/trial) - Start free trial
