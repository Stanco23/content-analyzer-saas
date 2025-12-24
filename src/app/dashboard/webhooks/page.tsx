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
import { Plus, Trash2, Copy } from "lucide-react";

const WEBHOOK_EVENTS = [
  { id: "analysis.completed", label: "Analysis Completed" },
  { id: "analysis.failed", label: "Analysis Failed" },
  { id: "quota.warning", label: "Quota Warning (80%)" },
  { id: "quota.exceeded", label: "Quota Exceeded" },
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
    try {
      const res = await fetch("/api/internal/webhooks/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newUrl, description: newDesc, events: selectedEvents }),
      });
      const data = await res.json();
      if (data.success) { fetchWebhooks(); setCreateOpen(false); setNewUrl(""); setNewDesc(""); setSelectedEvents([]); toast.success("Webhook created!"); }
      else toast.error(data.error?.message || "Failed");
    } catch { toast.error("Failed to create webhook"); }
  };

  const deleteWebhook = async (id: string) => {
    if (!confirm("Delete this webhook?")) return;
    try {
      const res = await fetch("/api/internal/webhooks/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if ((await res.json()).success) { fetchWebhooks(); toast.success("Webhook deleted"); }
    } catch { toast.error("Failed to delete"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Webhooks</h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> Add Webhook</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Webhook</DialogTitle>
              <DialogDescription>Receive real-time events at your endpoint</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Endpoint URL</Label>
                <Input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://your-server.com/webhook" />
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Production server" />
              </div>
              <div className="space-y-2">
                <Label>Events</Label>
                <div className="space-y-2">
                  {WEBHOOK_EVENTS.map((event) => (
                    <div key={event.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={event.id}
                        checked={selectedEvents.includes(event.id)}
                        onCheckedChange={(checked: boolean) => {
                          if (checked) setSelectedEvents([...selectedEvents, event.id]);
                          else setSelectedEvents(selectedEvents.filter((e) => e !== event.id));
                        }}
                      />
                      <label htmlFor={event.id} className="text-sm">{event.label}</label>
                    </div>
                  ))}
                </div>
              </div>
              <Button className="w-full" onClick={createWebhook} disabled={!newUrl || selectedEvents.length === 0}>
                Create Webhook
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Webhooks</CardTitle>
          <CardDescription>Endpoints receiving event notifications</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <p>Loading...</p> : webhooks.length === 0 ? (
            <p className="text-muted-foreground">No webhooks configured.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>URL</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Success</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhooks.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell className="font-mono text-sm max-w-[200px] truncate">{w.url}</TableCell>
                    <TableCell><Badge variant="outline">{w.events.length} events</Badge></TableCell>
                    <TableCell><Badge variant={w.isActive ? "default" : "secondary"}>{w.isActive ? "Active" : "Inactive"}</Badge></TableCell>
                    <TableCell>{w.lastSuccessAt ? new Date(w.lastSuccessAt).toLocaleDateString() : "Never"}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(w.secret); toast.success("Secret copied!"); }}>
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteWebhook(w.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </TableCell>
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
