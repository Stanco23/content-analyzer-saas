# Getting Started Guide

A quick start guide to integrate ContentLens API into your application.

---

## Prerequisites

Before you begin, ensure you have:

1. **Clerk Account** - For authentication ([Sign up](https://clerk.com))
2. **ContentLens Account** - For API access ([Sign up](https://contentlens.dev))
3. **Node.js 18+** - For TypeScript SDK

---

## Step 1: Set Up Authentication

### Install Clerk SDK

```bash
npm install @clerk/nextjs
```

### Configure Environment Variables

```env
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
```

### Wrap Your App

```typescript
// app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html>{children}</html>
    </ClerkProvider>
  );
}
```

---

## Step 2: Create Analysis Client

### TypeScript Client

```typescript
// lib/contentlens.ts

interface AnalyzeOptions {
  content: string;
  title?: string;
}

interface AnalysisResult {
  id: string;
  overallScore: number;
  readabilityScore: number;
  seoScore: number;
  // ... other fields
}

export class ContentLensClient {
  private baseUrl: string;

  constructor(baseUrl = "https://api.contentlens.dev/v1") {
    this.baseUrl = baseUrl;
  }

  async analyze(options: AnalyzeOptions, token: string): Promise<AnalysisResult> {
    const response = await fetch(`${this.baseUrl}/analyze`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error.message);
    }

    return result.data;
  }

  async enhance(options: {
    content: string;
    title?: string;
    options?: {
      goal?: string;
      tone?: string;
      reAnalyze?: boolean;
    };
  }, token: string) {
    const response = await fetch(`${this.baseUrl}/enhance`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error.message);
    }

    return result.data;
  }
}

export const contentlens = new ContentLensClient();
```

---

## Step 3: Create API Route

### Next.js API Route

```typescript
// app/api/analyze/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { contentlens } from "@/lib/contentlens";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { getToken } = auth();
    const token = await getToken();

    const body = await request.json();
    const result = await contentlens.analyze(body, token!);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
```

---

## Step 4: Use in Your App

### React Component

```tsx
// components/ContentAnalyzer.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";

export default function ContentAnalyzer() {
  const [content, setContent] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();

  const analyze = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content, title: "My Content" }),
      });

      const data = await response.json();
      setResult(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Paste your content here..."
        rows={10}
      />
      <button onClick={analyze} disabled={loading}>
        {loading ? "Analyzing..." : "Analyze"}
      </button>

      {result && (
        <div>
          <p>Overall Score: {result.overallScore}</p>
          <p>Readability: {result.readabilityScore}</p>
          <p>SEO: {result.seoScore}</p>
        </div>
      )}
    </div>
  );
}
```

---

## Step 5: Handle Errors

```typescript
try {
  const result = await contentlens.analyze({ content }, token);
} catch (error) {
  if (error.message.includes("QUOTA_EXCEEDED")) {
    // Show upgrade prompt
    window.location.href = "/pricing";
  } else if (error.message.includes("UNAUTHORIZED")) {
    // Redirect to sign in
    window.location.href = "/sign-in";
  } else {
    // Show error message
    alert(error.message);
  }
}
```

---

## Next Steps

1. [API Reference](/api-reference) - Full endpoint documentation
2. [Authentication Guide](/authentication) - Advanced auth patterns
3. [Scoring Guide](/guides/scoring-guide) - Understanding score metrics
4. [Examples](/examples) - Complete integration examples
