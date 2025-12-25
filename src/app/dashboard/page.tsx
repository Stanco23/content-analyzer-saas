"use client";

import { useUser } from "@clerk/nextjs";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Key,
  Activity,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Zap,
  BarChart3,
  Clock,
  Crown,
  Lock,
  X
} from "lucide-react";

interface Analysis {
  id: string;
  title: string | null;
  wordCount: number;
  readabilityScore: number | null;
  seoScore: number | null;
  createdAt: Date;
}

interface Stats {
  analysesCount: number;
  apiKeysCount: number;
  monthlyUsage: number;
  subscriptionTier: string;
}

interface StatCard {
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  bg: string;
  value?: string;
  isTier?: boolean;
}

const statCards: StatCard[] = [
  {
    title: "Total Analyses",
    description: "All-time analyses performed",
    icon: FileText,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "Active API Keys",
    description: "Keys for external integrations",
    icon: Key,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    title: "Monthly Usage",
    description: "Analyses this month",
    icon: Activity,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    title: "Current Plan",
    description: "Your subscription tier",
    icon: Sparkles,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
];

const tierColors: Record<string, string> = {
  FREE: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  PRO: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  BUSINESS: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

function DashboardContent() {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [upgradeContext, setUpgradeContext] = useState<string>("");
  const [stats, setStats] = useState<Stats>({
    analysesCount: 0,
    apiKeysCount: 0,
    monthlyUsage: 0,
    subscriptionTier: 'FREE' as string,
  });

  // Check for upgrade query param
  useEffect(() => {
    const upgradeParam = searchParams.get("upgrade");
    if (upgradeParam) {
      setUpgradeContext(upgradeParam);
      setShowUpgradeDialog(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isLoaded && user) {
      fetchDashboardData();
    }
  }, [isLoaded, user]);

  const fetchDashboardData = async () => {
    try {
      const analysesRes = await fetch("/api/internal/analyses/list?limit=5");
      const analysesData = await analysesRes.json();
      if (analysesData.success) {
        setAnalyses(analysesData.data);
      }

      const statsRes = await fetch("/api/internal/dashboard/stats");
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-muted-foreground";
    if (score >= 70) return "text-emerald-600 dark:text-emerald-500";
    if (score >= 50) return "text-yellow-600 dark:text-yellow-500";
    return "text-red-600 dark:text-red-500";
  };

  if (!isLoaded || loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
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
        <p className="text-muted-foreground mb-6">Please sign in to view your dashboard.</p>
        <Link href="/sign-in">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              Upgrade to Pro
            </DialogTitle>
            <DialogDescription>
              {upgradeContext === "enhance"
                ? "Content enhancement is a premium feature. Upgrade to unlock powerful AI-powered content improvements."
                : "Unlock premium features and analysis limits with a Pro subscription."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-lg bg-indigo-500/10">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">AI Content Enhancement</p>
                  <p className="text-xs text-muted-foreground">Improve, expand, and optimize your content</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Higher Analysis Limits</p>
                  <p className="text-xs text-muted-foreground">More analyses per month</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Zap className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Priority Processing</p>
                  <p className="text-xs text-muted-foreground">Faster analysis turnaround</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowUpgradeDialog(false)}>
                Maybe Later
              </Button>
              <Button className="flex-1 gap-2">
                <Crown className="h-4 w-4" />
                Upgrade Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Here is an overview of your content analysis activity.
            </p>
          </div>
        </div>
        <Link href="/dashboard/analyze">
          <Button className="gap-2">
            <Zap className="h-4 w-4" />
            New Analysis
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { ...statCards[0], value: stats.analysesCount.toLocaleString() },
          { ...statCards[1], value: stats.apiKeysCount.toString() },
          { ...statCards[2], value: stats.monthlyUsage.toLocaleString() },
          { ...statCards[3], value: stats.subscriptionTier, isTier: true },
        ].map((stat, i) => (
          <Card key={i} className="border-muted hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {stat.isTier ? (
                <Badge className={tierColors[stat.value] || tierColors.FREE}>{stat.value}</Badge>
              ) : (
                <div className="text-2xl font-bold">{stat.value}</div>
              )}
              <p className="text-xs text-muted-foreground mt-2">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Analyses */}
      <Card className="border-muted">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Recent Analyses
            </CardTitle>
            <CardDescription>Your latest content analysis results</CardDescription>
          </div>
          <Link href="/dashboard/history">
            <Button variant="ghost" size="sm" className="gap-1">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {analyses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <FileText className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No analyses yet</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Start by analyzing your first piece of content
              </p>
              <Link href="/dashboard/analyze">
                <Button className="gap-2">
                  <Zap className="h-4 w-4" />
                  Analyze Content
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {analyses.map((analysis) => (
                <Link
                  key={analysis.id}
                  href={`/dashboard/history`}
                  className="flex items-center justify-between p-4 rounded-xl border bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {analysis.title || "Untitled Analysis"}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(analysis.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {analysis.wordCount.toLocaleString()} words
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">SEO Score</p>
                      <p className={`text-lg font-semibold ${getScoreColor(analysis.seoScore)}`}>
                        {analysis.seoScore ? `${analysis.seoScore.toFixed(0)}%` : 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">Readability</p>
                      <p className={`text-lg font-semibold ${getScoreColor(analysis.readabilityScore)}`}>
                        {analysis.readabilityScore ? `${analysis.readabilityScore.toFixed(0)}%` : 'N/A'}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/dashboard/analyze">
          <Card className="border-muted hover:shadow-md hover:border-primary/50 transition-all cursor-pointer h-full group">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                  <Zap className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Analyze Content</h3>
                  <p className="text-sm text-muted-foreground">
                    Paste your content and get AI-powered insights
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/api-keys">
          <Card className="border-muted hover:shadow-md hover:border-primary/50 transition-all cursor-pointer h-full group">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                  <Key className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Manage API Keys</h3>
                  <p className="text-sm text-muted-foreground">
                    Create and manage API keys for integrations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/settings">
          <Card className="border-muted hover:shadow-md hover:border-primary/50 transition-all cursor-pointer h-full group">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
                  <TrendingUp className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Upgrade Plan</h3>
                  <p className="text-sm text-muted-foreground">
                    Unlock more analyses and premium features
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}
