# List Analyses

Retrieves a paginated list of content analyses for the authenticated user, with optional version grouping.

---

**Endpoint:** `GET /v1/analyses`
**Base URL:** `https://api.contentlens.dev`

> For local development: `GET /api/internal/analyses/list`

---

## Authorization

**Authentication:** Required (Clerk JWT)
**Header:** `Authorization: Bearer <your-jwt-token>`

---

## Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 50 | Number of items to return (max 100) |
| `id` | string | - | Get specific analysis by ID |
| `group` | boolean | false | Group analyses by version chain |

---

### Example Requests

#### List all analyses

```bash
curl -X GET "https://api.contentlens.dev/v1/analyses?limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Get single analysis

```bash
curl -X GET "https://api.contentlens.dev/v1/analyses?id=abc123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Group by version (with enhanced versions)

```bash
curl -X GET "https://api.contentlens.dev/v1/analyses?group=true&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Response

### 200 OK - Success (Flat List)

```json
{
  "success": true,
  "data": [
    {
      "id": "abc123",
      "title": "Understanding SEO",
      "content": "...",
      "word_count": 450,
      "readabilityScore": 88,
      "seoScore": 82,
      "grammarScore": 95,
      "engagementScore": 78,
      "isEnhanced": false,
      "originalAnalysisId": null,
      "createdAt": "2024-01-15T10:30:00Z"
    },
    {
      "id": "def456",
      "title": "Understanding SEO (Enhanced)",
      "content": "...",
      "word_count": 620,
      "readabilityScore": 92,
      "seoScore": 88,
      "grammarScore": 98,
      "engagementScore": 85,
      "isEnhanced": true,
      "originalAnalysisId": "abc123",
      "createdAt": "2024-01-15T10:35:00Z"
    }
  ],
  "grouped": false
}
```

### 200 OK - Success (Grouped by Version)

```json
{
  "success": true,
  "data": [
    {
      "root": {
        "id": "abc123",
        "title": "Understanding SEO",
        "createdAt": "2024-01-15T10:30:00Z",
        "readabilityScore": 88
      },
      "versions": [
        {
          "id": "abc123",
          "title": "Understanding SEO",
          "createdAt": "2024-01-15T10:30:00Z",
          "isEnhanced": false
        },
        {
          "id": "def456",
          "title": "Understanding SEO (Enhanced)",
          "createdAt": "2024-01-15T10:35:00Z",
          "isEnhanced": true
        }
      ],
      "versionCount": 2
    }
  ],
  "grouped": true
}
```

---

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique analysis ID |
| `title` | string | Title of the analysis |
| `content` | string | Analyzed content (truncated in list) |
| `word_count` | integer | Number of words |
| `readabilityScore` | float | Readability score (0-100) |
| `seoScore` | float | SEO score (0-100) |
| `grammarScore` | float | Grammar score (0-100) |
| `engagementScore` | float | Engagement score (0-100) |
| `isEnhanced` | boolean | Whether this is an enhanced version |
| `originalAnalysisId` | string \| null | ID of original if this is enhanced |
| `createdAt` | datetime | Creation timestamp |

### Grouped Response Additional Fields

| Field | Type | Description |
|-------|------|-------------|
| `root` | object | The original (non-enhanced) analysis |
| `versions` | array | All versions in the chain (including root) |
| `versionCount` | integer | Total number of versions |

---

## Error Responses

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
interface Analysis {
  id: string;
  title: string;
  readabilityScore: number;
  seoScore: number;
  createdAt: string;
  isEnhanced: boolean;
}

interface AnalysisGroup {
  root: Analysis;
  versions: Analysis[];
  versionCount: number;
}

async function listAnalyses(options: {
  limit?: number;
  id?: string;
  groupByVersion?: boolean;
} = {}) {
  const params = new URLSearchParams();
  if (options.limit) params.set("limit", options.limit.toString());
  if (options.id) params.set("id", options.id);
  if (options.groupByVersion) params.set("group", "true");

  const response = await fetch(
    `https://api.contentlens.dev/v1/analyses?${params}`,
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
const analyses = await listAnalyses({ limit: 10 });
const grouped = await listAnalyses({ groupByVersion: true, limit: 5 });
```

### Python

```python
import requests

def list_analyses(limit=50, analysis_id=None, group_by_version=False):
    params = {"limit": limit}
    if analysis_id:
        params["id"] = analysis_id
    if group_by_version:
        params["group"] = "true"

    response = requests.get(
        "https://api.contentlens.dev/v1/analyses",
        headers={"Authorization": f"Bearer {token}"},
        params=params
    )

    result = response.json()
    if not result["success"]:
        raise Exception(result["error"]["message"])

    return result["data"]

# Usage
analyses = list_analyses(limit=10)
grouped = list_analyses(group_by_version=True, limit=5)
```

---

## Rate Limits

This endpoint is not rate-limited per se, but uses your standard API quota.

---

## Tips

1. Use `group=true` to see content version chains at a glance
2. Filter by `id` to get details for a specific analysis
3. Use `limit` to paginate through large result sets

---

## See Also

- [Analyze Content](/docs/api-reference/analyses/analyze) - Create new analysis
- [Enhance Content](/docs/api-reference/analyses/enhance) - Create enhanced version
- [Version Control Guide](/docs/guides/version-control) - Understanding version chains
