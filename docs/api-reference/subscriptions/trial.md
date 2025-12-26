# Free Trial Management

Start a 14-day free trial for Pro features, or check trial status.

---

**Endpoint:**
- `GET /v1/subscriptions/trial` - Check trial status
- `POST /v1/subscriptions/trial` - Start free trial

**Base URL:** `https://api.contentlens.dev`

> For local development:
> - `GET /api/polar/trial` - Check status
> - `POST /api/polar/trial` - Start trial

---

## Authorization

**Authentication:** Required (Clerk JWT)
**Header:** `Authorization: Bearer <your-jwt-token>`

---

## GET - Check Trial Status

### Example Request

```bash
curl -X GET "https://api.contentlens.dev/v1/subscriptions/trial" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response

```json
{
  "success": true,
  "data": {
    "isEligibleForTrial": true,
    "isInTrial": false,
    "trialDaysRemaining": 0,
    "trialEndDate": null
  }
}
```

---

## POST - Start Free Trial

### Example Request

```bash
curl -X POST "https://api.contentlens.dev/v1/subscriptions/trial" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Response

```json
{
  "success": true,
  "message": "Trial started! You have 14 days of Pro access.",
  "data": {
    "subscriptionTier": "PRO",
    "subscriptionStatus": "TRIALING",
    "trialEndDate": "2024-01-29T10:30:00Z"
  }
}
```

---

## Trial Details

| Feature | Value |
|---------|-------|
| Duration | 14 days |
| Included Analyses | 500 (Pro tier limit) |
| Features | All Pro features |
| Auto-renewal | No - must upgrade to continue |

---

## Eligibility

A user is eligible for a trial if:
- They are on the FREE tier
- They are not currently in a trial
- They have never started a trial before

---

## Error Responses

### 400 Bad Request (Already Subscribed)

```json
{
  "success": false,
  "error": {
    "code": "TRIAL_NOT_AVAILABLE",
    "message": "Trial not available. You already have an active subscription or trial."
  }
}
```

---

## Code Examples

### JavaScript/TypeScript

```typescript
interface TrialStatus {
  isEligibleForTrial: boolean;
  isInTrial: boolean;
  trialDaysRemaining: number;
  trialEndDate: string | null;
}

async function getTrialStatus(): Promise<TrialStatus> {
  const response = await fetch(
    "https://api.contentlens.dev/v1/subscriptions/trial",
    {
      headers: {
        "Authorization": `Bearer ${await getToken()}`,
      },
    }
  );

  const result = await response.json();
  return result.data;
}

async function startTrial() {
  const response = await fetch(
    "https://api.contentlens.dev/v1/subscriptions/trial",
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

  return result.data;
}

// Usage
const status = await getTrialStatus();

if (status.isEligibleForTrial) {
  const trial = await startTrial();
  console.log(`Trial started! Ends: ${trial.trialEndDate}`);
}
```

### Python

```python
import requests

def get_trial_status():
    response = requests.get(
        "https://api.contentlens.dev/v1/subscriptions/trial",
        headers={"Authorization": f"Bearer {token}"}
    )
    return response.json()["data"]

def start_trial():
    response = requests.post(
        "https://api.contentlens.dev/v1/subscriptions/trial",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        json={}
    )

    result = response.json()
    if not result["success"]:
        raise Exception(result["error"]["message"])

    return result["data"]

# Usage
status = get_trial_status()
if status["isEligibleForTrial"]:
    trial = start_trial()
    print(f"Trial started! Ends: {trial['trialEndDate']}")
```

---

## Best Practices

1. **Check Eligibility First** - Don't show "Start Trial" button if not eligible
2. **Show Trial Status** - Display days remaining in the UI
3. **Offer Upgrade Before Expiry** - Prompt users before trial ends

---

## See Also

- [Create Checkout](/docs/api-reference/subscriptions/checkout) - Upgrade after trial
- [Customer Portal](/docs/api-reference/subscriptions/portal) - Manage subscription
- [Sync Subscription](/docs/api-reference/subscriptions/sync) - Check subscription status
