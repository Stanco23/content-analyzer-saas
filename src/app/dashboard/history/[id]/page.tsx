"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  BookOpen,
  Search,
  Zap,
  RefreshCw,
  Wand2
} from "lucide-react";

interface Suggestion {
  type: 'readability' | 'seo' | 'structure' | 'style' | 'grammar' | 'engagement' | 'accessibility';
  severity: 'high' | 'medium' | 'low';
  message: string;
}

interface AnalysisResult {
  id: string;
  title: string | null;
  content: string;
  wordCount: number;
  readabilityScore: number | null;
  seoScore: number | null;
  sentimentScore: number | null;
  gradeLevel: number | null;
  keywordDensity: Record<string, number> | null;
  suggestions: Suggestion[];
  isEnhanced: boolean;
  createdAt: string;
}

export default function AnalysisDetailPage() {
  const { user, isLoaded } = useUser();
  const params = useParams();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const id = params.id as string;

  useEffect(() => {
    if (isLoaded && user) {
      fetchAnalysis();
    }
  }, [isLoaded, user, id]);

  const fetchAnalysis = async () => {
    try {
      const res = await fetch(`/api/internal/analyses/list?id=${id}`);
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setAnalysis(data.data[0]);
      } else {
        setError("Analysis not found");
      }
    } catch (err) {
      setError("Failed to load analysis");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreBadge = (score: number | null, label: string) => {
    if (score === null) {
      return <Badge variant="secondary">{label}: N/A</Badge>;
    }
    const variant = score >= 70 ? "default" : score >= 50 ? "secondary" : "destructive";
    return (
      <Badge variant={variant} className="font-medium text-sm px-3 py-1">
        {label}: {score.toFixed(0)}%
      </Badge>
    );
  };

  if (!isLoaded || loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Card>
          <CardContent className="py-10">
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <FileText className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Sign in required</h1>
        <p className="text-muted-foreground mb-6">Please sign in to view this analysis.</p>
        <Link href="/sign-in">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Analysis Not Found</h1>
        <p className="text-muted-foreground mb-6">
          {error || "This analysis may have been deleted or you don't have access to it."}
        </p>
        <Link href="/dashboard/history">
          <Button className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to History
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link href="/dashboard/history">
            <Button variant="ghost" size="icon" className="mt-1">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {analysis.title || "Untitled Analysis"}
              </h1>
              {analysis.isEnhanced && (
                <Badge variant="secondary" className="gap-1">
                  <Wand2 className="h-3 w-3" />
                  Enhanced
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              Analyzed on {new Date(analysis.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              // Store content in session storage and navigate to enhance page
              sessionStorage.setItem('enhanceContent', analysis.content);
              sessionStorage.setItem('enhanceTitle', analysis.title || '');
              window.location.href = '/dashboard/enhance';
            }}
          >
            <Wand2 className="h-4 w-4" />
            Enhance
          </Button>
          <Link href="/dashboard/analyze">
            <Button className="gap-2">
              <Zap className="h-4 w-4" />
              New Analysis
            </Button>
          </Link>
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Search className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">SEO Score</span>
            </div>
            <div className="text-3xl font-bold">
              {analysis.seoScore?.toFixed(0) || "N/A"}%
            </div>
            {analysis.seoScore !== null && (
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    analysis.seoScore >= 70 ? "bg-green-500" :
                    analysis.seoScore >= 50 ? "bg-yellow-500" : "bg-red-500"
                  }`}
                  style={{ width: `${analysis.seoScore}%` }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Readability</span>
            </div>
            <div className="text-3xl font-bold">
              {analysis.readabilityScore?.toFixed(0) || "N/A"}%
            </div>
            {analysis.readabilityScore !== null && (
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    analysis.readabilityScore >= 70 ? "bg-green-500" :
                    analysis.readabilityScore >= 50 ? "bg-yellow-500" : "bg-red-500"
                  }`}
                  style={{ width: `${analysis.readabilityScore}%` }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Sentiment</span>
            </div>
            <div className="text-3xl font-bold">
              {analysis.sentimentScore != null ? `${analysis.sentimentScore.toFixed(0)}%` : "N/A"}
            </div>
            {analysis.sentimentScore !== null && (
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    analysis.sentimentScore >= 60 ? "bg-green-500" :
                    analysis.sentimentScore >= 40 ? "bg-yellow-500" : "bg-red-500"
                  }`}
                  style={{ width: `${analysis.sentimentScore}%` }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/5 to-orange-500/10 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <FileText className="h-5 w-5 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Grade Level</span>
            </div>
            <div className="text-3xl font-bold">
              {analysis.gradeLevel?.toFixed(1) || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {analysis.gradeLevel && analysis.gradeLevel <= 8 ? "Easy to read" :
               analysis.gradeLevel && analysis.gradeLevel <= 12 ? "Moderate" : "Complex"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content & Suggestions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Original Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Original Content
            </CardTitle>
            <CardDescription>
              {analysis.wordCount.toLocaleString()} words
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-muted/30 border max-h-96 overflow-y-auto">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {analysis.content}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Improvement Suggestions
            </CardTitle>
            <CardDescription>
              {analysis.suggestions?.length || 0} recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analysis.suggestions && analysis.suggestions.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {analysis.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border"
                  >
                    <CheckCircle2 className={`h-5 w-5 shrink-0 mt-0.5 ${
                      suggestion.severity === 'high' ? 'text-red-500' :
                      suggestion.severity === 'medium' ? 'text-yellow-500' : 'text-green-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs px-2 py-0 capitalize">
                          {suggestion.type}
                        </Badge>
                        <Badge variant={suggestion.severity === 'high' ? 'destructive' : suggestion.severity === 'medium' ? 'secondary' : 'default'} className="text-xs px-2 py-0 capitalize">
                          {suggestion.severity}
                        </Badge>
                      </div>
                      <span className="text-sm">{suggestion.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <CheckCircle2 className="h-10 w-10 text-green-500 mb-3" />
                <p className="font-medium">No suggestions</p>
                <p className="text-sm text-muted-foreground">
                  Your content looks great!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Keyword Density */}
      {analysis.keywordDensity && Object.keys(analysis.keywordDensity).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Keyword Density</CardTitle>
            <CardDescription>
              Most frequently used terms in your content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(analysis.keywordDensity)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 15)
                .map(([keyword, density]) => (
                  <Badge key={keyword} variant="outline" className="px-3 py-1">
                    {keyword}: {density.toFixed(1)}%
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
