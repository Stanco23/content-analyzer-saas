"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AnalyzePage() {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

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
        body: JSON.stringify({ content, title }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.data);
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analyze Content</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Content</CardTitle>
            <CardDescription>Paste your article or blog post</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title (optional)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your article title..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your content here (minimum 100 characters)..."
                className="min-h-[300px]"
              />
              <p className="text-sm text-muted-foreground">{content.length} characters</p>
            </div>
            <Button onClick={handleAnalyze} disabled={loading} className="w-full">
              {loading ? "Analyzing..." : "Analyze Content"}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
              <CardDescription>{result.word_count} words analyzed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Readability Score</p>
                  <p className="text-2xl font-bold">{result.readability?.score?.toFixed(1) || "N/A"}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">SEO Score</p>
                  <p className="text-2xl font-bold">{result.seo?.score?.toFixed(1) || "N/A"}</p>
                </div>
              </div>

              {result.suggestions?.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Suggestions</h3>
                  <div className="space-y-2">
                    {result.suggestions.map((s: any, i: number) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-lg">
                        <span className={`text-xs px-2 py-1 rounded ${
                          s.severity === "high" ? "bg-red-100 text-red-700" :
                          s.severity === "medium" ? "bg-yellow-100 text-yellow-700" :
                          "bg-green-100 text-green-700"
                        }`}>
                          {s.type}
                        </span>
                        <p className="mt-2 text-sm">{s.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
