"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  FileText,
  Brain,
  Target,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Lightbulb,
  ChevronRight,
  Loader2,
  TrendingUp,
  Clock,
  Type,
  Wand2,
  RefreshCw,
  FileUp,
  Eye,
  Crown,
  Lock
} from "lucide-react";

// Circular Progress Component
function CircularProgress({ value, label, color = "primary", size = 80 }: { value: number; label: string; color?: string; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  const colorClasses: Record<string, string> = {
    primary: "#6366f1",
    green: "#22c55e",
    yellow: "#eab308",
    red: "#ef4444",
    purple: "#a855f7",
    orange: "#f97316",
    pink: "#ec4899",
    cyan: "#06b6d4",
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colorClasses[color] || colorClasses.primary}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold">{Math.round(value)}%</span>
        </div>
      </div>
      <p className="text-sm font-medium mt-2">{label}</p>
    </div>
  );
}

export default function AnalyzePage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [isPremium, setIsPremium] = useState(false);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("results");

  // Check if user is premium
  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (!isUserLoaded) return;

      if (user) {
        try {
          const response = await fetch("/api/internal/user/profile");
          const data = await response.json();

          if (data.success) {
            const paidTiers = ["PRO", "BUSINESS", "API_STARTER", "API_GROWTH", "API_ENTERPRISE"];
            setIsPremium(paidTiers.includes(data.data.subscriptionTier));
          }
        } catch (error) {
          console.error("Failed to check premium status:", error);
        }
      }
    };

    checkPremiumStatus();
  }, [isUserLoaded, user]);

  const handleAnalyze = async () => {
    if (content.length < 100) {
      toast.error("Content must be at least 100 characters");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/internal/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          title,
          options: {
            include_keywords: true,
            include_readability: true,
            include_seo: true,
            include_grammar: true,
            include_accessibility: true,
            include_engagement: true,
            include_originality: true,
            include_sentiment: true,
          }
        }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.data);
        setActiveTab("results");
        toast.success("Analysis complete!");
      } else {
        toast.error(data.error?.message || "Analysis failed");
      }
    } catch {
      toast.error("Failed to analyze content");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800";
      case "low":
        return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return "primary";
    if (score >= 70) return "green";
    if (score >= 50) return "yellow";
    return "red";
  };

  const renderScoreCard = (score: number, label: string, color: string, icon: React.ReactNode, details?: string) => (
    <div className="p-4 rounded-xl bg-gradient-to-br from-white to-gray-50 border dark:from-gray-900 dark:to-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium flex items-center gap-1.5">
          {icon}
          {label}
        </span>
        {score >= 70 ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : score >= 50 ? (
          <AlertCircle className="h-5 w-5 text-yellow-500" />
        ) : (
          <AlertCircle className="h-5 w-5 text-red-500" />
        )}
      </div>
      <CircularProgress value={score || 0} label="" color={getScoreColor(score)} size={70} />
      {details && <p className="text-xs text-muted-foreground mt-2 text-center">{details}</p>}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analyze Content</h1>
        <p className="text-muted-foreground mt-1">
          Get AI-powered insights to improve your content quality, SEO, and engagement.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <Card className="border-muted">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Your Content</CardTitle>
                <CardDescription>Paste your article or blog post below</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title (optional)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your article title..."
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content">Content</Label>
                <span className={`text-sm ${content.length < 100 ? "text-muted-foreground" : "text-green-600"}`}>
                  {content.length.toLocaleString()} characters
                  {content.length >= 100 && " (minimum met)"}
                </span>
              </div>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your content here (minimum 100 characters)..."
                className="min-h-[200px] font-mono text-sm bg-background resize-none"
              />
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={loading || content.length < 100}
              className="w-full gap-2 h-12"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Analyze Content
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Minimum 100 characters required for analysis
            </p>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card className="border-muted">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10">
                <Brain className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <CardTitle>Analysis Results</CardTitle>
                <CardDescription>
                  {result ? `${(result.word_count || 0).toLocaleString()} words analyzed` : "Ready to analyze"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <BarChart3 className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No analysis yet</h3>
                <p className="text-muted-foreground max-w-sm">
                  Paste your content and click "Analyze Content" to get AI-powered insights.
                </p>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="results" className="gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Results
                  </TabsTrigger>
                  <TabsTrigger value="suggestions" className="gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Tips
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="results" className="space-y-6">
                  {/* Main Score Cards */}
                  <div className="grid grid-cols-3 gap-3">
                    {renderScoreCard(result.seo?.score || 0, "SEO", "blue", <TrendingUp className="h-4 w-4" />)}
                    {renderScoreCard(result.readability?.score || 0, "Readability", "purple", <Type className="h-4 w-4" />)}
                    {renderScoreCard(result.grammar?.score || 0, "Grammar", "green", <CheckCircle2 className="h-4 w-4" />)}
                  </div>

                  {/* Additional Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    {renderScoreCard(result.accessibility?.score || 0, "Accessibility", "cyan", <Eye className="h-4 w-4" />)}
                    {renderScoreCard(result.engagement?.score || 0, "Engagement", "orange", <TrendingUp className="h-4 w-4" />)}
                    {renderScoreCard(result.originality?.score || 0, "Originality", "pink", <Sparkles className="h-4 w-4" />)}
                    {renderScoreCard(result.sentimentScore || 0, "Sentiment", "green", <Brain className="h-4 w-4" />)}
                    {renderScoreCard(result.sourceRelevanceScore || 0, "Source Match", "primary", <FileUp className="h-4 w-4" />)}
                  </div>

                  {/* Content Stats */}
                  <div className="p-4 rounded-xl bg-muted/50 border">
                    <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Content Statistics
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-background/50">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Type className="h-4 w-4" />
                          <span className="text-xs">Word Count</span>
                        </div>
                        <p className="text-xl font-bold">{(result.word_count || 0).toLocaleString()}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-background/50">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Clock className="h-4 w-4" />
                          <span className="text-xs">Reading Time</span>
                        </div>
                        <p className="text-xl font-bold">{Math.ceil((result.word_count || 0) / 200)} min</p>
                      </div>
                      <div className="p-3 rounded-lg bg-background/50">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <FileText className="h-4 w-4" />
                          <span className="text-xs">Grade Level</span>
                        </div>
                        <p className="text-xl font-bold">{result.readability?.grade_level || "N/A"}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-background/50">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Target className="h-4 w-4" />
                          <span className="text-xs">AI Probability</span>
                        </div>
                        <p className="text-xl font-bold">{(result.originality?.ai_generated_probability * 100 || 0).toFixed(0)}%</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="suggestions" className="space-y-4">
                  {result.suggestions?.length > 0 ? (
                    <div className="space-y-3">
                      {result.suggestions.map((s: any, i: number) => (
                        <div
                          key={i}
                          className={`p-4 rounded-lg border ${getSeverityColor(s.severity)}`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs font-medium capitalize">
                              {s.type}
                            </Badge>
                            <span className="text-xs font-medium capitalize">{s.severity} priority</span>
                          </div>
                          <p className="text-sm">{s.message}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                      <h3 className="font-semibold mb-2">Excellent content!</h3>
                      <p className="text-muted-foreground text-sm">
                        No significant issues found in your content.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}

            {/* Action */}
            {result && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  {/* Premium Enhance Button */}
                  {isPremium ? (
                    <Button
                      variant="outline"
                      className="gap-2 bg-indigo-500/10 border-indigo-200 text-indigo-700 hover:bg-indigo-500/20 dark:bg-indigo-500/10 dark:border-indigo-800 dark:text-indigo-400"
                      onClick={() => {
                        sessionStorage.setItem('enhanceContent', content);
                        sessionStorage.setItem('enhanceTitle', title || '');
                        window.location.href = '/dashboard/enhance';
                      }}
                    >
                      <Wand2 className="h-4 w-4" />
                      Enhance This Content
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Lock className="h-4 w-4" />
                      <span>Upgrade to Pro to enhance content</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" className="gap-2" onClick={() => setResult(null)}>
                      Analyze Another
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tips Section */}
      <Card className="border-muted bg-muted/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Tips for Better Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-background/50">
              <div className="p-1.5 rounded-lg bg-primary/10 mt-0.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Use Keywords</p>
                <p className="text-sm text-muted-foreground">Include relevant keywords naturally.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-background/50">
              <div className="p-1.5 rounded-lg bg-primary/10 mt-0.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Short Paragraphs</p>
                <p className="text-sm text-muted-foreground">Keep paragraphs under 150 words.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-background/50">
              <div className="p-1.5 rounded-lg bg-primary/10 mt-0.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Add Headings</p>
                <p className="text-sm text-muted-foreground">Use H2 and H3 to structure content.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-background/50">
              <div className="p-1.5 rounded-lg bg-primary/10 mt-0.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Include Sources</p>
                <p className="text-sm text-muted-foreground">Add reference material for context.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
