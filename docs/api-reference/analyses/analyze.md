# Analyze Content

Analyzes content for quality metrics including readability, SEO, grammar, engagement, and more.

---

**Endpoint:** `POST /v1/analyze`
**Base URL:** `https://api.contentlens.dev`

> For local development: `POST /api/internal/analyze`

---

## Authorization

**Authentication:** Required (Clerk JWT)
**Header:** `Authorization: Bearer <your-jwt-token>`

---

## Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `content` | string | Yes | Content to analyze (50-50,000 characters) |
| `title` | string | No | Title of the content for context |

---

### Example Request

```bash
curl -X POST "https://api.contentlens.dev/v1/analyze" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Search engine optimization (SEO) is the practice of increasing the quantity and quality of traffic to your website through organic search engine results. A higher ranking when someone searches terms related to your business can significantly increase your business profitability.",
    "title": "Understanding SEO Fundamentals"
  }'
```

---

## Response

### 200 OK - Success

```json
{
  "success": true,
  "data": {
    "id": "abc123",
    "title": "Understanding SEO Fundamentals",
    "content_hash": "sha256...",
    "word_count": 45,
    "overallScore": 85,
    "readabilityScore": 88,
    "seoScore": 82,
    "grammarScore": 95,
    "engagementScore": 78,
    "originalityScore": 92,
    "sentimentScore": {
      "label": "neutral",
      "score": 0.85
    },
    "sourceRelevanceScore": 80,
    "keywordDensity": {
      "seo": 2.5,
      "optimization": 1.2,
      "traffic": 1.8
    },
    "suggestions": [
      {
        "type": "readability",
        "severity": "medium",
        "message": "Consider breaking up long paragraphs for better readability"
      }
    ],
    "processing_time_ms": 1250
  },
  "usage": {
    "used": 5,
    "limit": 500,
    "remaining": 495
  }
}
```

---

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique analysis ID |
| `word_count` | integer | Number of words in content |
| `overallScore` | float | Overall quality score (0-100) |
| `readabilityScore` | float | Flesch-Kincaid readability (0-100) |
| `seoScore` | float | SEO optimization score (0-100) |
| `grammarScore` | float | Grammar accuracy score (0-100) |
| `engagementScore` | float | Engagement potential (0-100) |
| `originalityScore` | float | Originality/plagiarism check (0-100) |
| `sentimentScore` | object | Sentiment analysis result |
| `keywordDensity` | object | Keyword frequency analysis |
| `suggestions` | array | Improvement suggestions |
| `processing_time_ms` | integer | Processing time in milliseconds |

---

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Content must be at least 50 characters"
  }
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing authentication token"
  }
}
```

### 402 Payment Required

```json
{
  "success": false,
  "error": {
    "code": "QUOTA_EXCEEDED",
    "message": "Monthly limit of 500 analyses reached. Please upgrade your plan."
  }
}
```

---

## Scoring Guide

| Score Range | Rating | Description |
|-------------|--------|-------------|
| 90-100 | Excellent | High-quality, publication-ready |
| 75-89 | Good | Minor improvements needed |
| 60-74 | Fair | Several improvements recommended |
| 0-59 | Poor | Major revisions needed |

---

## Code Examples

### JavaScript/TypeScript

```typescript
async function analyzeContent(content: string, title?: string) {
  const response = await fetch("https://api.contentlens.dev/v1/analyze", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${await getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content, title }),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
}
```

### Python

```python
import requests

def analyze_content(content, title=None):
    response = requests.post(
        "https://api.contentlens.dev/v1/analyze",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        json={"content": content, "title": title}
    )

    result = response.json()
    if not result["success"]:
        raise Exception(result["error"]["message"])

    return result["data"]
```

---

## Rate Limits

| Tier | Requests/Month | Per Minute |
|------|----------------|------------|
| Free | 5 | 10 |
| Pro | 500 | 60 |
| Business | 2,000 | 120 |

---

## See Also

- [Enhance Content](/docs/api-reference/analyses/enhance) - Improve your content
- [List Analyses](/docs/api-reference/analyses/list) - Get analysis history
- [Scoring Guide](/docs/guides/scoring-guide) - Understanding scores
