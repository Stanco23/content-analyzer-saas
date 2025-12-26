# ContentLens API Documentation

ContentLens provides a powerful AI-powered content analysis API that evaluates your content for readability, SEO, grammar, engagement, and more. Use our API to integrate content quality analysis into your applications.

---

## Quick Start

```bash
# Analyze content
curl -X POST "https://api.contentlens.dev/v1/analyze" \
  -H "Authorization: Bearer <your-api-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Your content goes here...",
    "title": "My Article"
  }'
```

---

## Features

### Content Analysis
- **Readability Score** - Evaluate how easy your content is to read
- **SEO Score** - Optimize content for search engines
- **Grammar Check** - Catch spelling and grammar errors
- **Engagement Analysis** - Measure content engagement potential
- **Sentiment Analysis** - Detect emotional tone
- **Keyword Density** - Analyze keyword distribution

### Content Enhancement
- **AI-Powered Rewriting** - Improve, simplify, or expand content
- **Tone Adjustment** - Professional, casual, academic, or persuasive
- **SEO Optimization** - Optimize content for search engines
- **Version Control** - Track content revisions

### Subscription Management
- **Multiple Tiers** - Free, Pro, Business, and API plans
- **Usage Tracking** - Monitor your API usage
- **Secure Payments** - Powered by Polar

---

## Base URLs

| Environment | URL |
|-------------|-----|
| Production | `https://api.contentlens.dev` |
| Development | `http://localhost:3000` (uses `/api/internal/` prefix) |

---

## API Versioning

Current API Version: **v1**

We follow semantic versioning for our API. Breaking changes will be introduced with a new major version number.

---

## Getting Help

- **Guides** → Step-by-step tutorials [→](/guides)
- **API Reference** → Complete endpoint documentation [→](/api-reference)
- **Support** → Get help with integration [→](/support)

---

## Next Steps

1. [Authentication Guide](/authentication) - Learn how to authenticate your requests
2. [Analyze Endpoint](/api-reference/analyses/analyze) - Start analyzing content
3. [Enhance Endpoint](/api-reference/analyses/enhance) - Improve your content
4. [Subscription Guide](/api-reference/subscriptions/overview) - Manage your plan
