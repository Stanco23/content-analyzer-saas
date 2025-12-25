"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, Trash2, Copy, Webhook, Zap, Link2, AlertTriangle, RefreshCw, Code } from "lucide-react";

const WEBHOOK_EVENTS = [
  { id: "analysis.completed", label: "Analysis Completed", description: "When an analysis finishes successfully" },
  { id: "analysis.failed", label: "Analysis Failed", description: "When an analysis encounters an error" },
  { id: "quota.warning", label: "Quota Warning (80%)", description: "When you reach 80% of your quota" },
  { id: "quota.exceeded", label: "Quota Exceeded", description: "When you exceed your monthly quota" },
];

interface Webhook {
  id: string;
  url: string;
  description: string | null;
  events: string[];
  isActive: boolean;
  secret: string;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => { fetchWebhooks(); }, []);

  const fetchWebhooks = async () => {
    try {
      const res = await fetch("/api/internal/webhooks/list");
      const data = await res.json();
      if (data.success) setWebhooks(data.data);
    } catch { toast.error("Failed to load webhooks"); }
    finally { setLoading(false); }
  };

  const createWebhook = async () => {
    if (!newUrl.trim()) {
      toast.error("Please enter a webhook URL");
      return;
    }
    if (selectedEvents.length === 0) {
      toast.error("Please select at least one event");
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch("/api/internal/webhooks/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newUrl, description: newDesc, events: selectedEvents }),
      });
      const data = await res.json();
      if (data.success) {
        fetchWebhooks();
        setCreateOpen(false);
        setNewUrl("");
        setNewDesc("");
        setSelectedEvents([]);
        toast.success("Webhook created successfully!");
      } else {
        toast.error(data.error?.message || "Failed to create webhook");
      }
    } catch {
      toast.error("Failed to create webhook");
    } finally {
      setIsCreating(false);
    }
  };

  const deleteWebhook = async (id: string) => {
    if (!confirm("Delete this webhook? This action cannot be undone.")) return;
    try {
      const res = await fetch("/api/internal/webhooks/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if ((await res.json()).success) {
        fetchWebhooks();
        toast.success("Webhook deleted");
      }
    } catch {
      toast.error("Failed to delete webhook");
    }
  };

  const copySecret = (secret: string) => {
    navigator.clipboard.writeText(secret);
    toast.success("Secret copied to clipboard!");
  };

  const resetCreateDialog = () => {
    setCreateOpen(false);
    setNewUrl("");
    setNewDesc("");
    setSelectedEvents([]);
  };

  const toggleEvent = (eventId: string) => {
    setSelectedEvents(prev =>
      prev.includes(eventId)
        ? prev.filter(e => e !== eventId)
        : [...prev, eventId]
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Webhook className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Webhooks</h1>
            <p className="text-muted-foreground mt-1">
              Receive real-time event notifications at your endpoint
            </p>
          </div>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Webhook</DialogTitle>
              <DialogDescription>
                Configure an endpoint to receive real-time events from ContentLens
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Endpoint URL</Label>
                <Input
                  id="webhookUrl"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://your-server.com/webhook"
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhookDesc">Description (optional)</Label>
                <Input
                  id="webhookDesc"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g., Production notifications"
                />
              </div>
              <div className="space-y-3">
                <Label>Events to subscribe</Label>
                <div className="grid gap-3">
                  {WEBHOOK_EVENTS.map((event) => (
                    <div
                      key={event.id}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border transition-colors cursor-pointer ${
                        selectedEvents.includes(event.id)
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-primary/50"
                      }`}
                      onClick={() => toggleEvent(event.id)}
                    >
                      <Checkbox
                        id={event.id}
                        checked={selectedEvents.includes(event.id)}
                        onCheckedChange={() => toggleEvent(event.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <label htmlFor={event.id} className="font-medium cursor-pointer">
                          {event.label}
                        </label>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                className="w-full"
                onClick={createWebhook}
                disabled={isCreating || !newUrl.trim() || selectedEvents.length === 0}
              >
                {isCreating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Webhook"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Info Card */}
      <Card className="border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-purple-600 dark:text-purple-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-purple-900 dark:text-purple-100">Real-time notifications</p>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Webhooks allow your application to receive instant updates when events occur in your ContentLens account.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Webhooks Table */}
      <Card className="border-muted">
        <CardHeader>
          <CardTitle>Your Webhooks</CardTitle>
          <CardDescription>Endpoints receiving event notifications</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : webhooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Link2 className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No webhooks configured</h3>
              <p className="text-muted-foreground mb-4 max-w-sm">
                Set up a webhook to receive real-time notifications
              </p>
              <Button className="gap-2" onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Webhook
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-1/3">URL</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Success</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhooks.map((w) => (
                  <TableRow key={w.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Link2 className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <code className="font-mono text-sm truncate block max-w-[200px]">{w.url}</code>
                          {w.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{w.description}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {w.events.length} event{w.events.length !== 1 ? "s" : ""}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={w.isActive ? "default" : "secondary"}>
                        {w.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {w.lastSuccessAt ? new Date(w.lastSuccessAt).toLocaleString() : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copySecret(w.secret)}
                          title="Copy secret"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                          onClick={() => deleteWebhook(w.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Signature Info */}
      <Card className="border-muted bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Code className="h-4 w-4" />
            Webhook Signatures
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            All webhook payloads are signed with a secret key using HMAC SHA-256. Verify signatures to ensure the request came from ContentLens.
          </p>
          <div className="p-4 rounded-xl bg-background border font-mono text-sm">
            <p className="text-muted-foreground mb-2">Request Headers:</p>
            <code className="text-primary">X-ContentLens-Signature: t=timestamp,v1=signature</code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
