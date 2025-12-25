"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  FileText,
  Upload,
  Wand2,
  Sparkles,
  Download,
  Copy,
  Check,
  RefreshCw,
  FileUp,
  FileType,
  Loader2,
  ChevronRight,
  History,
  Trash2,
  Save,
  Lock,
  Target,
  Crown
} from "lucide-react";

// Simulated file parsing function (in production, use pdf-parse, mammoth, etc.)
async function parseFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  // Simulate file reading delay
  await new Promise(resolve => setTimeout(resolve, 500));

  if (extension === 'txt') {
    return await file.text();
  }

  // For other file types, return sample content (in production, implement proper parsing)
  return `[Content from ${file.name}]\n\nThis is the extracted content from your file. In production, this would use libraries like pdf-parse for PDFs, mammoth for DOCX, etc.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`;
}

export default function EnhancePage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [enhancementTone, setEnhancementTone] = useState<string>("professional");
  const [enhancementGoal, setEnhancementGoal] = useState<string>("improve");
  const [enhancementLoading, setEnhancementLoading] = useState(false);
  const [enhancementProgress, setEnhancementProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("input");

  // Check if user is premium
  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (!isUserLoaded) return;

      if (!user) {
        router.push("/sign-in");
        return;
      }

      try {
        const response = await fetch("/api/internal/user/profile");
        const data = await response.json();

        if (data.success) {
          const paidTiers = ["PRO", "BUSINESS", "API_STARTER", "API_GROWTH", "API_ENTERPRISE"];
          if (!paidTiers.includes(data.data.subscriptionTier)) {
            // User is on FREE tier, redirect to upgrade
            router.push("/dashboard?upgrade=enhance");
            return;
          }
          setIsPremium(true);
        }
      } catch (error) {
        console.error("Failed to check premium status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkPremiumStatus();
  }, [isUserLoaded, user, router]);

  // Check for stored content from history page
  useEffect(() => {
    const storedContent = sessionStorage.getItem('enhanceContent');
    const storedTitle = sessionStorage.getItem('enhanceTitle');

    if (storedContent) {
      setContent(storedContent);
      if (storedTitle) {
        setTitle(storedTitle);
      }
      // Clear the stored data
      sessionStorage.removeItem('enhanceContent');
      sessionStorage.removeItem('enhanceTitle');
      toast.info("Content loaded from history - ready to enhance!");
    }
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    setLoading(true);
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    for (const file of selectedFiles) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      const allowedTypes = ['txt', 'pdf', 'docx', 'md', 'markdown'];

      if (allowedTypes.includes(extension || '')) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    }

    if (invalidFiles.length > 0) {
      toast.warning(`Skipped: ${invalidFiles.join(', ')} (unsupported format)`);
    }

    // Parse all valid files
    const parsedContents: string[] = [];
    for (const file of validFiles) {
      try {
        const text = await parseFile(file);
        parsedContents.push(text);
        setFiles(prev => [...prev, file]);
      } catch {
        toast.error(`Failed to parse ${file.name}`);
      }
    }

    if (parsedContents.length > 0) {
      const combinedContent = parsedContents.join('\n\n---\n\n');
      setContent(prev => prev ? `${prev}\n\n${combinedContent}` : combinedContent);
      toast.success(`Loaded ${parsedContents.length} file(s)`);
    }

    setLoading(false);
  }, []);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleEnhance = async () => {
    if (content.length < 50) {
      toast.error("Content must be at least 50 characters");
      return;
    }

    setEnhancementLoading(true);
    setEnhancementProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setEnhancementProgress(prev => Math.min(prev + 10, 90));
    }, 300);

    try {
      const response = await fetch("/api/internal/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          title: title || "Untitled Enhancement",
          options: {
            tone: enhancementTone,
            goal: enhancementGoal,
          }
        }),
      });

      clearInterval(progressInterval);
      setEnhancementProgress(100);

      const data = await response.json();
      if (data.success) {
        setResult(data.data);
        setActiveTab("result");
        toast.success("Content enhanced successfully!");
      } else {
        toast.error(data.error?.message || "Enhancement failed");
      }
    } catch {
      clearInterval(progressInterval);
      toast.error("Failed to enhance content");
    } finally {
      setEnhancementLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result?.enhanced_content || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadEnhanced = () => {
    const blob = new Blob([result?.enhanced_content || ""], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'enhanced-content'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const saveToHistory = async () => {
    if (!result?.enhanced_content) return;

    try {
      const response = await fetch("/api/internal/analyses/save-enhancement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalContent: content,
          enhancedContent: result.enhanced_content,
          title: title || "Untitled Enhancement",
          originalAnalysisId: null, // Could be passed if enhancing from history
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Saved to history!");
      } else {
        toast.error(data.error?.message || "Failed to save");
      }
    } catch {
      toast.error("Failed to save to history");
    }
  };

  // Show loading while checking premium status
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Checking subscription status...</p>
        </div>
      </div>
    );
  }

  // If not premium, show upgrade prompt (redirect should handle this, but as fallback)
  if (!isPremium) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-20 h-20 rounded-2xl bg-amber-500/10 flex items-center justify-center">
          <Lock className="h-10 w-10 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold mb-2">Premium Feature</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Content enhancement is available for Pro and Business subscribers only.
          </p>
        </div>
        <Link href="/dashboard?upgrade=enhance">
          <Button size="lg" className="gap-2">
            <Crown className="h-4 w-4" />
            Upgrade to Pro
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Wand2 className="h-8 w-8 text-indigo-600" />
            Enhance Content
          </h1>
          <p className="text-muted-foreground mt-1">
            Transform and improve your content with AI-powered enhancements.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/history">
            <History className="h-4 w-4 mr-2" />
            View History
          </Link>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="input" className="gap-2">
            <FileText className="h-4 w-4" />
            Input
          </TabsTrigger>
          <TabsTrigger value="result" disabled={!result} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Enhanced Result
          </TabsTrigger>
        </TabsList>

        <TabsContent value="input">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Input Section */}
            <Card className="border-muted">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10">
                    <FileText className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle>Content Input</CardTitle>
                    <CardDescription>Paste content or upload files to enhance</CardDescription>
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
                    placeholder="Enter a title for your content..."
                    className="bg-background"
                  />
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <Label>Upload Files (PDF, DOCX, TXT, MD)</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-6 text-center hover:border-indigo-500/50 transition-colors">
                    <input
                      type="file"
                      id="file-upload"
                      multiple
                      accept=".txt,.pdf,.docx,.md,.markdown"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                      <Upload className="h-10 w-10 text-muted-foreground" />
                      <span className="font-medium">Click to upload files</span>
                      <span className="text-xs text-muted-foreground">
                        or drag and drop files here
                      </span>
                    </label>
                  </div>

                  {/* File List */}
                  {files.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <Label>Attached Files</Label>
                      <div className="space-y-2">
                        {files.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                            <div className="flex items-center gap-3">
                              <FileType className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{file.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {(file.size / 1024).toFixed(1)} KB
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFile(index)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Content Textarea */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="content">Content</Label>
                    <span className={`text-sm ${content.length < 50 ? "text-muted-foreground" : "text-green-600"}`}>
                      {content.length.toLocaleString()} characters
                      {content.length >= 50 && " (minimum met)"}
                    </span>
                  </div>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste your content here, or upload files above..."
                    className="min-h-[200px] font-mono text-sm bg-background resize-none"
                  />
                </div>

                {/* Enhancement Options */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-200 dark:border-indigo-800 space-y-4">
                  <div className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5 text-indigo-600" />
                    <h3 className="font-semibold text-indigo-700 dark:text-indigo-400">Enhancement Settings</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Enhancement Goal</Label>
                      <Select value={enhancementGoal} onValueChange={setEnhancementGoal}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="improve">General Improvement</SelectItem>
                          <SelectItem value="simplify">Simplify Language</SelectItem>
                          <SelectItem value="expand">Expand Content</SelectItem>
                          <SelectItem value="formal">Make More Formal</SelectItem>
                          <SelectItem value="casual">Make More Casual</SelectItem>
                          <SelectItem value="persuasive">More Persuasive</SelectItem>
                          <SelectItem value="seo">SEO Optimized</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Tone</Label>
                      <Select value={enhancementTone} onValueChange={setEnhancementTone}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="academic">Academic</SelectItem>
                          <SelectItem value="persuasive">Persuasive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                {loading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Enhancing content...</span>
                      <span>{enhancementProgress}%</span>
                    </div>
                    <Progress value={enhancementProgress} className="h-2" />
                  </div>
                )}

                <Button
                  onClick={handleEnhance}
                  disabled={enhancementLoading || content.length < 50}
                  className="w-full gap-2 h-12"
                  size="lg"
                >
                  {enhancementLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enhancing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Enhance Content
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Preview Section */}
            <Card className="border-muted">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10">
                    <FileText className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle>Content Preview</CardTitle>
                    <CardDescription>Your input content will appear here</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!content ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                      <FileText className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">No content yet</h3>
                    <p className="text-muted-foreground max-w-sm">
                      Paste content or upload files to see a preview here.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-muted/50 border font-mono text-sm whitespace-pre-wrap max-h-[600px] overflow-y-auto">
                    {content}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="result">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Original vs Enhanced */}
            <Card className="border-muted">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10">
                    <FileText className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle>Original Content</CardTitle>
                    <CardDescription>Your original input</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-xl bg-muted/50 border font-mono text-sm whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                  {content}
                </div>
              </CardContent>
            </Card>

            <Card className="border-muted">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-green-500/10">
                      <Sparkles className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle>Enhanced Content</CardTitle>
                      <CardDescription>AI-improved version</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      <span className="ml-2">{copied ? "Copied!" : "Copy"}</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadEnhanced}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={saveToHistory}>
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-xl bg-green-500/5 border border-green-200 dark:border-green-800 font-mono text-sm whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                  {result?.enhanced_content || "No enhanced content yet"}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4 mt-6">
            <Button variant="outline" onClick={() => setActiveTab("input")}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Enhance Another
            </Button>
            <Button onClick={() => {
              setContent(result?.enhanced_content || "");
              setTitle(title ? `${title} (Enhanced)` : "Untitled Enhancement");
              setActiveTab("input");
            }}>
              <ChevronRight className="h-4 w-4 mr-2" />
              Enhance This Result
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Tips Section */}
      <Card className="border-muted bg-muted/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Enhancement Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-background/50">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 mt-0.5">
                <FileType className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium">Upload Files</p>
                <p className="text-sm text-muted-foreground">Support for PDF, DOCX, TXT, Markdown.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-background/50">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 mt-0.5">
                <Target className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium">Set Goals</p>
                <p className="text-sm text-muted-foreground">Choose what you want to achieve.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-background/50">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 mt-0.5">
                <RefreshCw className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium">Iterate</p>
                <p className="text-sm text-muted-foreground">Enhance the enhanced result multiple times.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-background/50">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 mt-0.5">
                <Save className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium">Save History</p>
                <p className="text-sm text-muted-foreground">Keep track of all enhancements.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
