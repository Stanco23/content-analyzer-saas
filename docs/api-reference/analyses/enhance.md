# Enhance Content

Uses AI to improve, simplify, expand, or rewrite your content while maintaining the original meaning.

---

**Endpoint:** `POST /v1/enhance`
**Base URL:** `https://api.contentlens.dev`

> For local development: `POST /api/internal/enhance`

---

## Authorization

**Authentication:** Required (Clerk JWT)
**Header:** `Authorization: Bearer <your-jwt-token>`

---

## Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `content` | string | Yes | Content to enhance (50-50,000 characters) |
| `title` | string | No | Title of the content |
| `analysisId` | string | No | Link to original analysis for versioning |
| `options` | object | No | Enhancement options (see below) |

### Options Object

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `goal` | enum | `improve` | Enhancement goal (see goals below) |
| `tone` | enum | `professional` | Target tone (see tones below) |
| `reAnalyze` | boolean | `true` | Run analysis on enhanced content |

### Enhancement Goals

| Goal | Description |
|------|-------------|
| `improve` | Improve overall quality, clarity, and grammar |
| `simplify` | Make content more accessible and easier to understand |
| `expand` | Add more details, examples, and depth |
| `formal` | Transform to more formal, professional tone |
| `casual` | Transform to conversational, friendly tone |
| `persuasive` | Make content more compelling and actionable |
| `seo` | Optimize for search engines with keyword integration |

### Tones

| Tone | Description |
|------|-------------|
| `professional` | Business-appropriate, formal |
| `casual` | Conversational, friendly |
| `academic` | Scholarly, research-oriented |
| `persuasive` | Marketing-focused, compelling |

---

### Example Request

```bash
curl -X POST "https://api.contentlens.dev/v1/enhance" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Digital marketing helps businesses reach customers online. It includes social media and email marketing.",
    "title": "Digital Marketing Basics",
    "options": {
      "goal": "expand",
      "tone": "professional",
      "reAnalyze": true
    }
  }'
```

---

## Response

### 200 OK - Success

```json
{
  "success": true,
  "data": {
    "id": "enhanced_xyz789",
    "enhanced_content": "Digital marketing is a strategic approach that enables businesses to connect with their target audiences through various online channels. This comprehensive discipline encompasses numerous tactics, including social media marketing, email campaigns, search engine optimization, and content marketing strategies...",
    "original_length": 120,
    "enhanced_length": 450,
    "improvement_percentage": 275,
    "tokens_used": 2500,
    "analysis": {
      "readabilityScore": 92,
      "seoScore": 88,
      "grammarScore": 98,
      "engagementScore": 85
    }
  },
  "usage": {
    "used": 6,
    "limit": 500,
    "remaining": 494
  }
}
```

---

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | New analysis ID for the enhanced version |
| `enhanced_content` | string | The AI-enhanced content |
| `original_length` | integer | Character count of original |
| `enhanced_length` | integer | Character count of enhanced version |
| `improvement_percentage` | integer | % change in content length |
| `tokens_used` | integer | AI tokens consumed |
| `analysis` | object | Quality scores of enhanced content (if reAnalyze=true) |

---

## Version Control

When you provide an `analysisId`, the enhanced version is linked to the original:

```json
{
  "data": {
    "id": "enhanced_xyz789",
    "originalAnalysisId": "abc123",
    "isEnhanced": true,
    "title": "Digital Marketing Basics (Enhanced)"
  }
}
```

Use [List Analyses](/api-reference/analyses/list) with `group=true` to retrieve version chains.

---

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid enhancement goal. Valid goals: improve, simplify, expand, formal, casual, persuasive, seo"
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

---

## Code Examples

### JavaScript/TypeScript

```typescript
interface EnhanceOptions {
  goal?: "improve" | "simplify" | "expand" | "formal" | "casual" | "persuasive" | "seo";
  tone?: "professional" | "casual" | "academic" | "persuasive";
  reAnalyze?: boolean;
}

async function enhanceContent(
  content: string,
  title: string,
  options: EnhanceOptions = {}
) {
  const response = await fetch("https://api.contentlens.dev/v1/enhance", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${await getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content, title, options }),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
}

// Usage
const enhanced = await enhanceContent(
  "Your content here...",
  "My Article",
  { goal: "seo", tone: "professional" }
);

console.log(`Enhanced content: ${enhanced.enhanced_content}`);
console.log(`Improvement: ${enhanced.improvement_percentage}%`);
```

### Python

```python
import requests

def enhance_content(content, title=None, goal="improve", tone="professional", re_analyze=True):
    response = requests.post(
        "https://api.contentlens.dev/v1/enhance",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        json={
            "content": content,
            "title": title,
            "options": {
                "goal": goal,
                "tone": tone,
                "reAnalyze": re_analyze
            }
        }
    )

    result = response.json()
    if not result["success"]:
        raise Exception(result["error"]["message"])

    return result["data"]

# Usage
enhanced = enhance_content(
    "Your content here...",
    goal="expand",
    tone="professional"
)
```

---

## Rate Limits

Each enhancement counts as one analysis toward your monthly limit.

| Tier | Monthly Analyses |
|------|-----------------|
| Free | 5 |
| Pro | 500 |
| Business | 2,000 |

---

## Tips for Best Results

1. **Provide a title** - Helps AI understand context
2. **Choose the right goal** - Match enhancement to your needs
3. **Set reAnalyze=true** - Get quality scores for the enhanced version
4. **Iterate** - Enhance multiple times for best results

---

## See Also

- [Analyze Content](/api-reference/analyses/analyze) - Get quality scores
- [List Analyses](/api-reference/analyses/list) - View version history
- [Version Control Guide](/guides/version-control) - Managing content revisions
