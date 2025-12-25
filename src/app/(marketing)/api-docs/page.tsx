"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Copy,
  AlertCircle,
  ChevronRight,
  Terminal,
  Shield,
  Clock,
  BarChart,
  FileText,
} from "lucide-react";

const endpoints = [
  {
    method: "POST",
    path: "/api/v1/analyze",
    title: "Content Analysis",
    description: "Analyze content for quality, readability, SEO, and AI-generated detection.",
    requestBody: {
      content: {
        type: "string",
        required: true,
        description: "The text content to analyze",
      },
      options: {
        type: "object",
        required: false,
        description: "Analysis options",
        properties: {
          check_seo: { type: "boolean", default: true, description: "Analyze SEO factors" },
          check_readability: { type: "boolean", default: true, description: "Calculate readability scores" },
          detect_ai: { type: "boolean", default: true, description: "Detect AI-generated content" },
          language: { type: "string", default: "en", description: "Content language code" },
        },
      },
    },
    response: {
      status: "success",
      data: {
        overall_score: 85,
        readability: {
          score: 72,
          grade: "7th grade",
          flesch_kincaid: 65.4,
        },
        seo: {
          score: 78,
          issues: ["Missing meta description", "Title too short"],
          suggestions: ["Add more keywords", "Increase content length"],
        },
        ai_detection: {
          is_ai_generated: false,
          confidence: 0.12,
          indicators: [],
        },
        sentiment: {
          score: 0.65,
          label: "positive",
        },
        word_count: 1250,
        processing_time_ms: 342,
      },
    },
  },
  {
    method: "POST",
    path: "/api/v1/batch-analyze",
    title: "Batch Analysis",
    description: "Analyze multiple content items in a single request for efficiency.",
    requestBody: {
      items: {
        type: "array",
        required: true,
        description: "Array of content items to analyze",
        items: {
          type: "object",
          properties: {
            id: { type: "string", description: "Unique identifier for the item" },
            content: { type: "string", description: "Text content to analyze" },
            options: { type: "object", description: "Per-item analysis options" },
          },
        },
        minItems: 1,
        maxItems: 100,
      },
      options: {
        type: "object",
        required: false,
        description: "Global batch options",
        properties: {
          parallel: { type: "boolean", default: true, description: "Process items in parallel" },
          priority: { type: "string", enum: ["low", "normal", "high"], default: "normal" },
        },
      },
    },
    response: {
      status: "success",
      data: {
        results: [
          {
            id: "item-1",
            overall_score: 85,
            word_count: 1250,
            processing_time_ms: 342,
          },
          {
            id: "item-2",
            overall_score: 72,
            word_count: 890,
            processing_time_ms: 298,
          },
        ],
        summary: {
          total_items: 2,
          successful: 2,
          failed: 0,
          avg_score: 78.5,
          total_processing_time_ms: 640,
        },
      },
    },
  },
  {
    method: "GET",
    path: "/api/v1/usage",
    title: "Usage Statistics",
    description: "Retrieve your current API usage statistics and quotas.",
    queryParams: [
      { name: "period", type: "string", required: false, description: "Time period: day, week, month, or all" },
      { name: "include_details", type: "boolean", required: false, description: "Include detailed breakdown" },
    ],
    response: {
      status: "success",
      data: {
        plan: "pro",
        limits: {
          monthly_requests: 100000,
          daily_requests: 5000,
          batch_size: 100,
        },
        usage: {
          current_month: {
            requests: 45230,
            words_analyzed: 12500000,
          },
          current_day: {
            requests: 1234,
            words_analyzed: 345000,
          },
        },
        remaining: {
          monthly: 54770,
          daily: 3766,
        },
      },
    },
  },
  {
    method: "GET",
    path: "/api/v1/health",
    title: "Health Check",
    description: "Check the API service health and availability status.",
    response: {
      status: "success",
      data: {
        status: "healthy",
        version: "1.0.0",
        timestamp: "2024-12-24T10:30:00Z",
        services: {
          api: "healthy",
          database: "healthy",
          cache: "healthy",
          ai_model: "healthy",
        },
        uptime_seconds: 86400,
      },
    },
  },
];

const errorResponses = [
  { code: 400, message: "Bad Request", description: "Invalid request parameters or body" },
  { code: 401, message: "Unauthorized", description: "Missing or invalid API key" },
  { code: 403, message: "Forbidden", description: "Insufficient permissions or quota exceeded" },
  { code: 404, message: "Not Found", description: "Resource not found" },
  { code: 429, message: "Rate Limited", description: "Too many requests" },
  { code: 500, message: "Internal Server Error", description: "Server error" },
];

const rateLimitTiers = [
  { plan: "Free", requests: "1,000/month", batch: "10 items" },
  { plan: "Starter", requests: "30,000/month", batch: "50 items" },
  { plan: "Pro", requests: "100,000/month", batch: "100 items" },
  { plan: "Enterprise", requests: "Unlimited", batch: "Custom" },
];

function CodeBlock({ code, language = "json" }: { code: object | string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const codeString = typeof code === "string" ? code : JSON.stringify(code, null, 2);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-lg overflow-hidden border bg-muted/50">
      <div className="flex items-center justify-between px-4 py-2 bg-muted border-b">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground uppercase">{language}</span>
        </div>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={copyToClipboard}>
          {copied ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm">
        <code className="text-foreground">{codeString}</code>
      </pre>
    </div>
  );
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400",
    POST: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
    PUT: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:text-yellow-400",
    DELETE: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
  };

  return (
    <Badge variant="outline" className={`${colors[method] || ""} font-mono font-semibold`}>
      {method}
    </Badge>
  );
}

function ParamTable({ params }: { params: Record<string, any> | Array<{ name: string; type: string; required?: boolean; description: string }> | undefined }) {
  const isArray = Array.isArray(params);

  if (!params) {
    return null;
  }

  if (isArray) {
    return (
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">Parameter</th>
              <th className="text-left p-3 font-medium">Type</th>
              <th className="text-left p-3 font-medium">Required</th>
              <th className="text-left p-3 font-medium">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {(params as Array<{ name: string; type: string; required?: boolean; description: string }>).map((param) => (
              <tr key={param.name}>
                <td className="p-3 font-mono text-primary">{param.name}</td>
                <td className="p-3 text-muted-foreground">{param.type}</td>
                <td className="p-3">
                  {param.required ? (
                    <Badge variant="secondary" className="text-xs">Required</Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">Optional</span>
                  )}
                </td>
                <td className="p-3 text-muted-foreground">{param.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const paramsObj = params as Record<string, any>;
  return (
    <div className="rounded-lg border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left p-3 font-medium">Field</th>
            <th className="text-left p-3 font-medium">Type</th>
            <th className="text-left p-3 font-medium">Required</th>
            <th className="text-left p-3 font-medium">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {Object.entries(paramsObj).map(([key, value]: [string, any]) => (
            <tr key={key}>
              <td className="p-3 font-mono text-primary">
                {key}
                {value.type === "object" && <span className="text-muted-foreground ml-1">{"{...}"}</span>}
              </td>
              <td className="p-3 text-muted-foreground">{value.type}</td>
              <td className="p-3">
                {value.required ? (
                  <Badge variant="secondary" className="text-xs">Required</Badge>
                ) : (
                  <span className="text-muted-foreground text-xs">Optional</span>
                )}
              </td>
              <td className="p-3 text-muted-foreground">{value.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TableOfContents() {
  const [activeSection, setActiveSection] = useState("introduction");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-100px 0px -80% 0px" }
    );

    document.querySelectorAll("section[id]").forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const items = [
    { id: "introduction", label: "Introduction" },
    { id: "authentication", label: "Authentication" },
    { id: "endpoints", label: "Endpoints" },
    { id: "errors", label: "Errors" },
    { id: "rate-limiting", label: "Rate Limiting" },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="space-y-1">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => scrollToSection(item.id)}
          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
            activeSection === item.id
              ? "bg-primary text-primary-foreground font-medium"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">API Documentation</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Integrate ContentLens into your applications with our powerful REST API.
            Analyze content quality, detect AI-generated text, and optimize for SEO.
          </p>
          <div className="flex gap-3 mt-6">
            <Button asChild>
              <Link href="/dashboard">Get API Key</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="https://github.com/contentlens" target="_blank">
                View on GitHub
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Table of Contents Sidebar */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <div className="rounded-lg border bg-card p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <ChevronRight className="w-4 h-4" />
                  On This Page
                </h3>
                <TableOfContents />
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-16">
            {/* Introduction */}
            <section id="introduction" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Introduction</h2>
              </div>
              <p className="text-muted-foreground mb-6">
                The ContentLens API provides programmatic access to our content analysis platform.
                Build powerful content analysis features into your applications with just a few API calls.
              </p>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Base URL</CardTitle>
                </CardHeader>
                <CardContent>
                  <code className="text-sm bg-muted px-3 py-2 rounded block">
                    https://api.contentlens.io/v1
                  </code>
                </CardContent>
              </Card>
            </section>

            {/* Authentication */}
            <section id="authentication" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Authentication</h2>
              </div>
              <p className="text-muted-foreground mb-6">
                All API requests require authentication using an API key. Include your key in the
                request header for every call.
              </p>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Authentication Header</CardTitle>
                </CardHeader>
                <CardContent>
                  <CodeBlock
                    code={{ Authorization: "Bearer YOUR_API_KEY" }}
                    language="http"
                  />
                </CardContent>
              </Card>
              <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Keep your API keys secure. Never expose them in client-side code or public repositories.
                </p>
              </div>
            </section>

            {/* Endpoints */}
            <section id="endpoints" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <Terminal className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Endpoints</h2>
              </div>
              <p className="text-muted-foreground mb-8">
                Explore our API endpoints to integrate content analysis into your applications.
              </p>

              <div className="space-y-12">
                {endpoints.map((endpoint, index) => (
                  <Card key={index} id={endpoint.path.replace(/\//g, "-").slice(1)} className="overflow-hidden">
                    <CardHeader className="bg-muted/30">
                      <div className="flex items-center gap-3 flex-wrap">
                        <MethodBadge method={endpoint.method} />
                        <code className="text-sm font-mono">{endpoint.path}</code>
                      </div>
                      <CardTitle className="mt-3">{endpoint.title}</CardTitle>
                      <CardDescription>{endpoint.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                      {/* Request Parameters/Body */}
                      {"queryParams" in endpoint ? (
                        <div>
                          <h4 className="text-sm font-semibold mb-3">Query Parameters</h4>
                          <ParamTable params={endpoint.queryParams} />
                        </div>
                      ) : (
                        <div>
                          <h4 className="text-sm font-semibold mb-3">Request Body</h4>
                          <ParamTable params={endpoint.requestBody} />
                        </div>
                      )}

                      {/* Response */}
                      <div>
                        <h4 className="text-sm font-semibold mb-3">Response Example</h4>
                        <CodeBlock code={endpoint.response} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Errors */}
            <section id="errors" className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Errors</h2>
              </div>
              <p className="text-muted-foreground mb-6">
                The API uses standard HTTP status codes to indicate success or failure.
              </p>
              <Card>
                <CardContent className="pt-6">
                  <div className="rounded-lg border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-3 font-medium">Status</th>
                          <th className="text-left p-3 font-medium">Error</th>
                          <th className="text-left p-3 font-medium">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {errorResponses.map((error) => (
                          <tr key={error.code}>
                            <td className="p-3">
                              <Badge
                                variant="outline"
                                className={
                                  error.code >= 500
                                    ? "bg-red-500/10 text-red-600 border-red-500/20"
                                    : error.code >= 400
                                    ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                                    : "bg-green-500/10 text-green-600 border-green-500/20"
                                }
                              >
                                {error.code}
                              </Badge>
                            </td>
                            <td className="p-3 font-medium">{error.message}</td>
                            <td className="p-3 text-muted-foreground">{error.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Rate Limiting */}
            <section id="rate-limiting" className="scroll-mt-24 pb-12">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Rate Limiting</h2>
              </div>
              <p className="text-muted-foreground mb-6">
                API requests are limited based on your subscription plan. Rate limits are reset
                according to your billing cycle.
              </p>
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="rounded-lg border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-3 font-medium">Plan</th>
                          <th className="text-left p-3 font-medium">Monthly Requests</th>
                          <th className="text-left p-3 font-medium">Batch Size</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {rateLimitTiers.map((tier) => (
                          <tr key={tier.plan}>
                            <td className="p-3 font-medium">{tier.plan}</td>
                            <td className="p-3 text-muted-foreground">{tier.requests}</td>
                            <td className="p-3 text-muted-foreground">{tier.batch}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
              <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <BarChart className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Rate limit headers are included in every response to help you track your usage.
                  Check <code className="bg-blue-500/20 px-1.5 py-0.5 rounded">X-RateLimit-Remaining</code> for remaining requests.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
