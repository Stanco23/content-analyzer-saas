# API Reference

Complete reference documentation for the ContentLens API.

---

## Endpoints Overview

### Analyses

| Endpoint | Method | Description |
|----------|--------|-------------|
| [Analyze](/docs/api-reference/analyses/analyze) | `POST` | Analyze content for quality metrics |
| [Enhance](/docs/api-reference/analyses/enhance) | `POST` | Improve/rewrite content with AI |
| [List Analyses](/docs/api-reference/analyses/list) | `GET` | Retrieve user's analysis history |

### Subscriptions

| Endpoint | Method | Description |
|----------|--------|-------------|
| [Create Checkout](/docs/api-reference/subscriptions/checkout) | `POST` | Create a checkout session |
| [Customer Portal](/docs/api-reference/subscriptions/portal) | `POST` | Get customer portal URL |
| [Sync Subscription](/docs/api-reference/subscriptions/sync) | `POST` | Sync subscription from Polar |
| [Trial](/docs/api-reference/subscriptions/trial) | `GET/POST` | Start or check trial status |

### User

| Endpoint | Method | Description |
|----------|--------|-------------|
| [Get Profile](/docs/api-reference/user/profile) | `GET` | Get current user profile |

---

## Base URL

```
https://api.contentlens.dev/v1
```

For local development:
```
http://localhost:3000/api/internal
```

---

## Authentication

All API endpoints require authentication using Clerk JWT tokens. Include the token in the `Authorization` header:

```bash
Authorization: Bearer <your-jwt-token>
```

[Learn more about authentication →](/docs/authentication)

---

## Rate Limits

| Tier | Requests/Month | Rate Limit |
|------|----------------|------------|
| Free | 5 | 10/minute |
| Pro | 500 | 60/minute |
| Business | 2,000 | 120/minute |
| API Starter | Unlimited | 300/minute |
| API Growth | Unlimited | 600/minute |
| API Enterprise | Unlimited | 1,000/minute |

---

## Response Format

All responses follow a consistent format:

```json
{
  "success": true,
  "data": { ... },
  "usage": {
    "used": 5,
    "limit": 500,
    "remaining": 495
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

---

## Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing authentication |
| `QUOTA_EXCEEDED` | 402 | Monthly limit reached |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request parameters |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Pagination

List endpoints support pagination via query parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 50 | Number of items to return (max 100) |
| `cursor` | string | - | Pagination cursor for next page |

---

## Next Steps

- [Analyze Endpoint](/docs/api-reference/analyses/analyze) - Start analyzing content
- [Enhance Endpoint](/docs/api-reference/analyses/enhance) - Improve your content
- [Authentication Guide](/docs/authentication) - Set up authentication
