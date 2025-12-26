# Customer Portal

Gets a secure URL to the customer portal where users can manage their subscription, update payment methods, and view invoices.

---

**Endpoint:** `POST /v1/subscriptions/portal`
**Base URL:** `https://api.contentlens.dev`

> For local development: `POST /api/polar/portal`

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
curl -X POST "https://api.contentlens.dev/v1/subscriptions/portal" \
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
  "url": "https://billing.stripe.com/p/session/abc123",
  "expiresAt": "2024-01-16T10:30:00Z"
}
```

---

## What Users Can Do in the Portal

- View current subscription plan and status
- Upgrade or downgrade subscription
- Update payment method (credit card)
- Download invoices
- Cancel subscription
- Reactivate canceled subscription

---

## Error Responses

### 404 Not Found (No Customer)

```json
{
  "success": false,
  "error": {
    "code": "NO_CUSTOMER",
    "message": "No billing customer found. Please complete a purchase first."
  }
}
```

### 404 Not Found (No Subscription)

```json
{
  "success": false,
  "error": {
    "code": "NO_SUBSCRIPTION",
    "message": "No active subscription found."
  }
}
```

---

## Code Examples

### JavaScript/TypeScript

```typescript
async function getCustomerPortalUrl() {
  const response = await fetch(
    "https://api.contentlens.dev/v1/subscriptions/portal",
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
    if (result.error.code === "NO_CUSTOMER") {
      // Redirect to pricing page
      window.location.href = "/pricing";
      return null;
    }
    throw new Error(result.error.message);
  }

  return result.url;
}

// Usage
const portalUrl = await getCustomerPortalUrl();
if (portalUrl) {
  window.location.href = portalUrl;
}
```

### Python

```python
import requests

def get_customer_portal_url():
    response = requests.post(
        "https://api.contentlens.dev/v1/subscriptions/portal",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        json={}
    )

    result = response.json()
    if not result["success"]:
        if result["error"]["code"] == "NO_CUSTOMER":
            print("No customer found. Please make a purchase first.")
            return None
        raise Exception(result["error"]["message"])

    return result["url"]

# Usage
url = get_customer_portal_url()
if url:
    print(f"Portal URL: {url}")
```

---

## Best Practices

1. **Direct Link**: Provide a clear "Manage Subscription" button in your app
2. **Error Handling**: Handle `NO_CUSTOMER` by redirecting to checkout
3. **Timeout**: Portal links expire after 24 hours - get a new one when needed

---

## See Also

- [Create Checkout](/docs/api-reference/subscriptions/checkout) - Purchase subscription
- [Sync Subscription](/docs/api-reference/subscriptions/sync) - Check subscription status
- [Trial Endpoint](/docs/api-reference/subscriptions/trial) - Start free trial
