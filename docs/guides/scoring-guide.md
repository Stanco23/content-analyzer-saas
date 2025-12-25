# Scoring Guide

Understanding the quality scores returned by the ContentLens API.

---

## Score Overview

All scores range from 0-100, with higher scores indicating better performance.

| Score | Rating | Description |
|-------|--------|-------------|
| 90-100 | Excellent | Publication-ready, no major improvements needed |
| 75-89 | Good | Minor improvements can further enhance quality |
| 60-74 | Fair | Several areas need attention |
| 0-59 | Poor | Significant revisions recommended |

---

## Readability Score

Measures how easy your content is to read using the Flesch-Kincaid formula.

### Factors Considered
- Sentence length
- Word complexity (syllables)
- Paragraph structure
- Passive vs. active voice

### Improving Readability
- Use shorter sentences (15-20 words average)
- Prefer simple words over complex ones
- Break up long paragraphs
- Use active voice

---

## SEO Score

Evaluates how well your content is optimized for search engines.

### Factors Considered
- Keyword density and distribution
- Title and meta information
- Heading structure
- Internal/external links
- Content length

### Improving SEO
- Include primary keyword in title and first paragraph
- Use related keywords naturally
- Structure with H1, H2, H3 headings
- Aim for 1,500+ words for competitive keywords

---

## Grammar Score

Checks for spelling, grammar, and punctuation errors.

### Factors Considered
- Spelling accuracy
- Grammar rules
- Punctuation usage
- Capitalization

### Improving Grammar
- Run spell-check before submitting
- Review complex sentence structures
- Ensure proper subject-verb agreement

---

## Engagement Score

Predicts how engaging your content will be for readers.

### Factors Considered
- Content structure
- Use of lists and bullet points
- Variety in sentence length
- Emotional triggers
- Call-to-action presence

### Improving Engagement
- Start with a compelling hook
- Use subheadings to break up text
- Include relevant examples
- End with a clear call-to-action

---

## Originality Score

Checks for plagiarism and duplicate content.

### Factors Considered
- Similarity to indexed content
- Paraphrase quality
- Citation requirements

### Maintaining Originality
- Always cite sources
- Paraphrase rather than quote directly
- Add unique insights and analysis

---

## Sentiment Analysis

Detects the emotional tone of your content.

### Response Format

```json
{
  "label": "positive",
  "score": 0.85
}
```

| Label | Description |
|-------|-------------|
| positive | Optimistic, favorable tone |
| negative | Critical, unfavorable tone |
| neutral | Balanced, objective tone |
| mixed | Contains multiple sentiments |

---

## Overall Score

A weighted average of all individual scores:

| Component | Weight |
|-----------|--------|
| Readability | 25% |
| SEO | 25% |
| Grammar | 20% |
| Engagement | 20% |
| Originality | 10% |

---

## Response Example

```json
{
  "overallScore": 82,
  "readabilityScore": 88,
  "seoScore": 78,
  "grammarScore": 95,
  "engagementScore": 75,
  "originalityScore": 92,
  "sentimentScore": {
    "label": "informative",
    "score": 0.78
  }
}
```

---

## Next Steps

- [Analyze Content](/docs/api-reference/analyses/analyze) - Start analyzing
- [Enhance Content](/docs/api-reference/analyses/enhance) - Improve your content
- [API Reference](/docs/api-reference) - Full endpoint documentation
