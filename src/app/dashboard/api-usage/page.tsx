"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
  Key,
  CheckCircle2,
  XCircle,
  BarChart3,
  RefreshCw
} from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  tier: string;
  dailyUsage: number;
  dailyLimit: number;
  monthlyUsage: number;
  monthlyLimit: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
}

interface UsageLog {
  id: string;
  endpoint: string;
  statusCode: number;
  processingTimeMs: number | null;
  tokensUsed: number | null;
  timestamp: string;
}

interface Stats {
  totalRequests: number;
  successRate: number;
  activeKeys: number;
}

const tierColors: Record<string, string> = {
  STARTER: "bg-blue-100 text-blue-700",
  GROWTH: "bg-purple-100 text-purple-700",
  ENTERPRISE: "bg-orange-100 text-orange-700",
};

export default function ApiUsagePage() {
  const { user, isLoaded } = useUser();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [recentLogs, setRecentLogs] = useState<UsageLog[]>([]);
  const [stats, setStats] = useState<Stats>({ totalRequests: 0, successRate: 0, activeKeys: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      fetchApiUsage();
    }
  }, [isLoaded, user]);

  const fetchApiUsage = async () => {
    try {
      const res = await fetch("/api/internal/api-usage");
      const data = await res.json();
      if (data.success) {
        setApiKeys(data.data.apiKeys);
        setRecentLogs(data.data.recentLogs);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch API usage:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="py-6">
                <div className="h-8 w-24 bg-muted animate-pulse rounded" />
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
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Activity className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Sign in required</h1>
        <p className="text-muted-foreground mb-6">Please sign in to view API usage.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          API Usage
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor your API usage and performance metrics
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-muted">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Requests
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Zap className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">All-time API requests</p>
          </CardContent>
        </Card>

        <Card className="border-muted">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Success Rate
            </CardTitle>
            <div className="p-2 rounded-lg bg-green-500/10">
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.successRate.toFixed(1)}%</div>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={stats.successRate} className="h-2 flex-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Keys
            </CardTitle>
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Key className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeKeys}</div>
            <p className="text-xs text-muted-foreground mt-1">API keys in use</p>
          </CardContent>
        </Card>
      </div>

      {/* API Key Usage */}
      <Card className="border-muted">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Key className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>API Key Usage</CardTitle>
              <CardDescription>Usage and limits by API key</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {apiKeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Key className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">No API keys yet</h3>
              <p className="text-sm text-muted-foreground">
                Create an API key to start tracking usage
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Key Name</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Daily Usage</TableHead>
                  <TableHead>Monthly Usage</TableHead>
                  <TableHead>Total Requests</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Key className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{key.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={tierColors[key.tier] || "bg-muted"}>
                        {key.tier}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{key.dailyUsage.toLocaleString()}</span>
                          <span className="text-muted-foreground">/ {key.dailyLimit.toLocaleString()}</span>
                        </div>
                        <Progress
                          value={(key.dailyUsage / key.dailyLimit) * 100}
                          className="h-2"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{key.monthlyUsage.toLocaleString()}</span>
                          <span className="text-muted-foreground">/ {key.monthlyLimit.toLocaleString()}</span>
                        </div>
                        <Progress
                          value={(key.monthlyUsage / key.monthlyLimit) * 100}
                          className="h-2"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">
                      {key.totalRequests.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent API Calls */}
      <Card className="border-muted">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Recent API Calls</CardTitle>
              <CardDescription>Last 20 API requests</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {recentLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Activity className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">No API calls yet</h3>
              <p className="text-sm text-muted-foreground">
                Your API requests will appear here
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time (ms)</TableHead>
                  <TableHead>Tokens</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <code className="font-mono text-sm bg-muted px-2 py-1 rounded">
                        {log.endpoint}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {log.statusCode < 400 ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <Badge variant={log.statusCode < 400 ? "default" : "destructive"}>
                          {log.statusCode}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.processingTimeMs !== null ? (
                        <span className="font-mono">{log.processingTimeMs}ms</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {log.tokensUsed !== null ? (
                        <span className="font-mono">{log.tokensUsed.toLocaleString()}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Performance Tips */}
      <Card className="border-muted bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base">Optimizing API Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded bg-primary/10 mt-0.5">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Batch Requests</p>
                <p className="text-muted-foreground">Combine multiple analyses when possible.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded bg-primary/10 mt-0.5">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Cache Results</p>
                <p className="text-muted-foreground">Store analysis results to avoid redundant calls.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded bg-primary/10 mt-0.5">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Use Webhooks</p>
                <p className="text-muted-foreground">Receive results asynchronously to reduce polling.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
