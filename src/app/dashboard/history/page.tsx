"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  History,
  ArrowRight,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  Zap,
  Filter,
  MoreHorizontal
} from "lucide-react";

interface Analysis {
  id: string;
  title: string | null;
  wordCount: number;
  readabilityScore: number | null;
  seoScore: number | null;
  createdAt: string;
}

export default function HistoryPage() {
  const { user, isLoaded } = useUser();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("all");
  const limit = 10;

  useEffect(() => {
    if (isLoaded && user) {
      fetchAnalyses();
    }
  }, [isLoaded, user, page, filter]);

  const fetchAnalyses = async () => {
    try {
      const res = await fetch(`/api/internal/analyses/list?limit=${limit}&offset=${(page - 1) * limit}`);
      const data = await res.json();
      if (data.success) {
        setAnalyses(data.data);
        setTotalPages(data.data.length === limit ? page + 1 : page);
      }
    } catch (error) {
      console.error("Failed to fetch analyses:", error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreBadge = (score: number | null, label: string) => {
    if (!score) {
      return <Badge variant="secondary">{label}: N/A</Badge>;
    }
    const variant = score >= 70 ? "default" : score >= 50 ? "secondary" : "destructive";
    return (
      <Badge variant={variant} className="font-medium">
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
        <p className="text-muted-foreground mb-6">Please sign in to view your history.</p>
        <Link href="/sign-in">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <History className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analysis History</h1>
            <p className="text-muted-foreground mt-1">
              View and manage all your past content analyses
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

      {/* Filters & Stats */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            All
          </Button>
          <Button
            variant={filter === "recent" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("recent")}
          >
            Recent
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          Showing {analyses.length} of {(analyses.length + (page - 1) * limit).toLocaleString()} analyses
        </div>
      </div>

      <Card className="border-muted">
        <CardContent className="p-0">
          {analyses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No analyses found</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                You have not performed any content analyses yet. Start by analyzing your first piece of content.
              </p>
              <Link href="/dashboard/analyze">
                <Button className="gap-2">
                  <Zap className="h-4 w-4" />
                  Analyze Content
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-1/3">Title</TableHead>
                    <TableHead>Words</TableHead>
                    <TableHead>SEO Score</TableHead>
                    <TableHead>Readability</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analyses.map((a) => (
                    <TableRow key={a.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate max-w-[200px]">
                              {a.title || "Untitled Analysis"}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(a.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">{a.wordCount.toLocaleString()}</span>
                          <span className="text-muted-foreground text-sm">words</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getScoreBadge(a.seoScore, "SEO")}
                      </TableCell>
                      <TableCell>
                        {getScoreBadge(a.readabilityScore, "Read")}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(a.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/dashboard/history/${a.id}`}>
                          <Button variant="ghost" size="sm" className="gap-1">
                            View
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={analyses.length < limit}
                    className="gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
