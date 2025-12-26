# Version Control Guide

Managing content versions and enhancement history.

---

## Understanding Versions

Every time you enhance content, a new version is created and linked to the original. This creates a version chain you can track and manage.

---

## Version Chain Structure

```
Original Analysis (v1)
  |
  +-- Enhanced Version 1 (v2)
        |
        +-- Enhanced Version 2 (v3)
```

### Field Reference

| Field | Description |
|-------|-------------|
| `isEnhanced` | `true` if this version was created via enhancement |
| `originalAnalysisId` | ID of the original (root) analysis |
| `title` | Title includes "(Enhanced)" suffix |

---

## Retrieving Version Chains

Use the `group=true` parameter to get grouped version data:

```bash
curl -X GET "https://api.contentlens.dev/v1/analyses?group=true&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Grouped Response

```json
{
  "data": [
    {
      "root": {
        "id": "abc123",
        "title": "My Article",
        "createdAt": "2024-01-15T10:00:00Z"
      },
      "versions": [
        { "id": "abc123", "title": "My Article", "isEnhanced": false },
        { "id": "def456", "title": "My Article (Enhanced)", "isEnhanced": true },
        { "id": "ghi789", "title": "My Article (Enhanced)", "isEnhanced": true }
      ],
      "versionCount": 3
    }
  ]
}
```

---

## Creating New Versions

Enhance an existing analysis by passing its ID:

```bash
curl -X POST "https://api.contentlens.dev/v1/enhance" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "analysisId": "abc123",
    "content": "Your enhanced content...",
    "options": {
      "goal": "improve",
      "reAnalyze": true
    }
  }'
```

---

## Best Practices

### 1. Keep Track of Originals
Don't delete original analyses - they serve as the root of your version chain.

### 2. Use Descriptive Titles
Update titles to reflect version changes:
- "My Article (SEO Optimized)"
- "My Article (Simplified)"

### 3. Compare Versions
Retrieve all versions and compare scores:

```typescript
const groups = await listAnalyses({ groupByVersion: true });

groups.forEach(group => {
  console.log(`${group.root.title}:`);
  group.versions.forEach((version, i) => {
    console.log(`  v${i + 1}: ${version.readabilityScore || 'N/A'} readability`);
  });
});
```

### 4. Limit Chain Length
For complex content, create new original analyses rather than infinitely extending chains.

---

## Common Patterns

### A/B Testing
Create multiple enhanced versions to test different approaches:

1. Original analysis
2. Version with "improve" goal
3. Version with "seo" goal
4. Version with "simplify" goal

### Iterative Enhancement
Enhance progressively:
1. Start with original
2. First pass: Simplify complex sections
3. Second pass: Add SEO keywords
4. Final pass: Refine tone

### Collaboration
Share specific version IDs with collaborators:
```
Original: abc123
SEO-optimized version: def456
```

---

## Limitations

- Maximum 100 analyses per user
- Version chains inherit parent limits
- Orphaned enhanced versions (original deleted) show as single-item groups

---

## See Also

- [List Analyses](/api-reference/analyses/list) - Retrieve analyses with grouping
- [Enhance Content](/api-reference/analyses/enhance) - Create new versions
- [Analyze Content](/api-reference/analyses/analyze) - Create original analysis
