# Get User Profile

Retrieves the authenticated user's profile including subscription details and usage information.

---

**Endpoint:** `GET /v1/user/profile`
**Base URL:** `https://api.contentlens.dev`

> For local development: `GET /api/internal/user/profile`

---

## Authorization

**Authentication:** Required (Clerk JWT)
**Header:** `Authorization: Bearer <your-jwt-token>`

---

## Request

No parameters required.

---

### Example Request

```bash
curl -X GET "https://api.contentlens.dev/v1/user/profile" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Response

```json
{
  "success": true,
  "data": {
    "id": "user_abc123",
    "clerkId": "user_xyz789",
    "email": "user@example.com",
    "name": "John Doe",
    "subscriptionTier": "PRO",
    "subscriptionStatus": "ACTIVE",
    "monthlyAnalysesUsed": 45,
    "subscriptionLimit": 500,
    "analysesCount": 120,
    "createdAt": "2024-01-01T00:00:00Z",
    "trialEndDate": null
  }
}
```

---

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Internal user ID |
| `clerkId` | string | Clerk user ID |
| `email` | string | User's email address |
| `name` | string \| null | User's name |
| `subscriptionTier` | string | Current tier (FREE, PRO, BUSINESS, API_*) |
| `subscriptionStatus` | string | Status (ACTIVE, INACTIVE, CANCELLED, PAST_DUE, TRIALING) |
| `monthlyAnalysesUsed` | integer | Analyses used this month |
| `subscriptionLimit` | integer | Monthly limit for tier |
| `analysesCount` | integer | Total analyses ever run |
| `createdAt` | datetime | Account creation date |
| `trialEndDate` | datetime \| null | Trial expiration date (if in trial) |

---

## Tier Limits Reference

| Tier | Monthly Limit |
|------|---------------|
| FREE | 5 |
| PRO | 500 |
| BUSINESS | 2,000 |
| API_STARTER | Unlimited |
| API_GROWTH | Unlimited |
| API_ENTERPRISE | Unlimited |

---

## Code Examples

### JavaScript/TypeScript

```typescript
interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  subscriptionTier: string;
  subscriptionStatus: string;
  monthlyAnalysesUsed: number;
  subscriptionLimit: number;
  analysesCount: number;
}

async function getUserProfile(): Promise<UserProfile> {
  const response = await fetch(
    "https://api.contentlens.dev/v1/user/profile",
    {
      headers: {
        "Authorization": `Bearer ${await getToken()}`,
      },
    }
  );

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
}

// Usage
const user = await getUserProfile();
console.log(`Welcome, ${user.name || user.email}`);
console.log(`Plan: ${user.subscriptionTier}`);
console.log(`Used: ${user.monthlyAnalysesUsed}/${user.subscriptionLimit}`);
```

### Python

```python
import requests

def get_user_profile():
    response = requests.get(
        "https://api.contentlens.dev/v1/user/profile",
        headers={"Authorization": f"Bearer {token}"}
    )

    result = response.json()
    if not result["success"]:
        raise Exception(result["error"]["message"])

    return result["data"]

# Usage
user = get_user_profile()
print(f"Welcome, {user['name'] or user['email']}")
print(f"Plan: {user['subscriptionTier']}")
print(f"Used: {user['monthlyAnalysesUsed']}/{user['subscriptionLimit']}")
```

---

## See Also

- [Sync Subscription](/api-reference/subscriptions/sync) - Update subscription status
- [Create Checkout](/api-reference/subscriptions/checkout) - Upgrade plan
- [Customer Portal](/api-reference/subscriptions/portal) - Manage subscription
