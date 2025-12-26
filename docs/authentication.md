# Authentication

ContentLens API uses Clerk for authentication. All API requests require a valid JWT token issued by Clerk.

---

## Authentication Methods

### 1. User Authentication (Frontend)

For user-facing applications, use Clerk's frontend SDK to authenticate users:

```typescript
import { useAuth } from "@clerk/nextjs";

export default function MyComponent() {
  const { getToken } = useAuth();

  async function callApi() {
    const token = await getToken();
    const response = await fetch("https://api.contentlens.dev/v1/analyze", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: "Your content..." }),
    });
    return response.json();
  }
}
```

### 2. API Key Authentication (Server-to-Server)

For server-side integrations, generate a JWT using your Clerk secret key:

```typescript
import { SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.CLERK_SECRET_KEY);

async function createToken(userId: string) {
  return await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);
}
```

### 3. Bearer Token Authentication

Include the token in the Authorization header:

```bash
curl -X POST "https://api.contentlens.dev/v1/analyze" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Your content here"}'
```

---

## Getting Your Credentials

1. **User ID**: Find your Clerk user ID in the Clerk Dashboard or via the URL when logged in
2. **Secret Key**: Get your Clerk secret key from the Clerk Dashboard:
   - Go to [Clerk Dashboard](https://dashboard.clerk.com)
   - Navigate to **API Keys**
   - Copy your **Secret Key**

---

## Environment Variables

Set these in your `.env.local` file:

```env
# Clerk credentials
CLERK_USER_ID=user_your_user_id
CLERK_SECRET_KEY=sk_test_your_secret_key

# ContentLens API (for production)
CONTENTLENS_API_URL=https://api.contentlens.dev/v1
CONTENTLENS_API_KEY=your-api-key
```

---

## Token Expiration

JWT tokens expire after 1 hour. Implement token refresh logic:

```typescript
async function refreshTokenIfNeeded() {
  const { sessionToken, getToken } = useAuth();
  if (!sessionToken || isExpired(sessionToken)) {
    return await getToken();
  }
  return sessionToken;
}
```

---

## Error Handling

Handle authentication errors gracefully:

```typescript
try {
  const response = await fetch("https://api.contentlens.dev/v1/analyze", {
    // ... request options
  });

  if (response.status === 401) {
    // Token expired or invalid - redirect to sign in
    window.location.href = "/sign-in";
    return;
  }

  const data = await response.json();
  return data;
} catch (error) {
  console.error("API Error:", error);
}
```

---

## Security Best Practices

1. **Never expose your Clerk secret key** in client-side code
2. **Use environment variables** for all credentials
3. **Implement token refresh** before expiration
4. **Validate tokens** on your server before making API calls
5. **Use HTTPS** for all API requests

---

## Next Steps

- [API Reference](/api-reference) - Browse all endpoints
- [Analyze Endpoint](/api-reference/analyses/analyze) - Start analyzing content
- [Rate Limits](/api-reference#rate-limits) - Understand usage limits
