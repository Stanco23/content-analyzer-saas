"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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

  useEffect(() => {
    if (isLoaded && user) {
      fetchAnalyses();
    }
  }, [isLoaded, user]);

  const fetchAnalyses = async () => {
    try {
      const res = await fetch("/api/internal/analyses/list?limit=50");
      const data = await res.json();
      if (data.success) {
        setAnalyses(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch analyses:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Analysis History</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Analysis History</h1>
        <p className="text-muted-foreground">Please sign in to view your history.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analysis History</h1>

      <Card>
        <CardHeader>
          <CardTitle>Recent Analyses</CardTitle>
          <CardDescription>Your last 50 content analyses</CardDescription>
        </CardHeader>
        <CardContent>
          {analyses.length === 0 ? (
            <p className="text-muted-foreground">No analyses yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Words</TableHead>
                  <TableHead>Readability</TableHead>
                  <TableHead>SEO</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analyses.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.title || "Untitled"}</TableCell>
                    <TableCell>{a.wordCount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={a.readabilityScore && a.readabilityScore >= 70 ? "default" : a.readabilityScore && a.readabilityScore >= 50 ? "secondary" : "destructive"}>
                        {a.readabilityScore ? a.readabilityScore.toFixed(0) : 0}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={a.seoScore && a.seoScore >= 70 ? "default" : a.seoScore && a.seoScore >= 50 ? "secondary" : "destructive"}>
                        {a.seoScore ? a.seoScore.toFixed(0) : 0}%
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(a.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
