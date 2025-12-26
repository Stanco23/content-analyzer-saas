"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Settings,
  User,
  CreditCard,
  Bell,
  Shield,
  Mail,
  Calendar,
  Sparkles,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
  RefreshCw
} from "lucide-react";

interface UserData {
  subscriptionTier: string;
  subscriptionStatus: string;
  monthlyAnalysesUsed: number;
  email: string;
  name: string | null;
  createdAt: string;
  polarCustomerId: string | null;
}

const tierInfo: Record<string, { color: string; label: string }> = {
  FREE: { color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300", label: "Free Plan" },
  PRO: { color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", label: "Pro Plan" },
  BUSINESS: { color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", label: "Business Plan" },
  API_STARTER: { color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", label: "API Starter" },
  API_GROWTH: { color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400", label: "API Growth" },
  API_ENTERPRISE: { color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", label: "API Enterprise" },
};

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [openingPortal, setOpeningPortal] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [analysisReports, setAnalysisReports] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      fetchUserData();
    }
  }, [isLoaded, user]);

  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/internal/user/profile");
      const data = await res.json();
      if (data.success) {
        setUserData(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setOpeningPortal(true);
    try {
      const res = await fetch("/api/polar/portal", {
        method: "POST",
      });
      const data = await res.json();

      if (data.success && data.portalUrl) {
        window.location.href = data.portalUrl;
        return;
      }

      // Handle specific errors with helpful messages
      if (data.error === 'NO_CUSTOMER' || data.error === 'CUSTOMER_NOT_FOUND') {
        alert(`Subscription not found. Please subscribe to a plan first to access billing management.`);
      } else if (data.error === 'POLAR_API_ERROR') {
        alert(`Payment system configuration error. Please contact support at sales@contentlens.dev.`);
      } else {
        alert(`Failed to open customer portal: ${data.message || data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Failed to open customer portal:", error);
      alert("Failed to open customer portal. Please try again.");
    } finally {
      setOpeningPortal(false);
    }
  };

  const handleSyncSubscription = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/polar/sync", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        await fetchUserData();
        alert(`Subscription synced! Tier: ${data.tier || 'None'}, Status: ${data.status || 'None'}`);
      } else {
        alert(`Sync failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Failed to sync subscription:", error);
      alert("Failed to sync subscription. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="py-6">
              <div className="flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-6">
              <div className="flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user || !userData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <User className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Sign in required</h1>
        <p className="text-muted-foreground mb-6">Please sign in to view your settings.</p>
      </div>
    );
  }

  const tier = tierInfo[userData.subscriptionTier] || tierInfo.FREE;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <Settings className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Subscription Card */}
        <Card className="border-muted">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Subscription</CardTitle>
                <CardDescription>Manage your subscription and billing</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border">
              <div>
                <p className="text-sm text-muted-foreground">Current Plan</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={tier.color}>{tier.label}</Badge>
                  <Badge variant="outline">{userData.subscriptionStatus}</Badge>
                </div>
              </div>
              <Sparkles className="h-5 w-5 text-primary" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border bg-background">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-sm">Usage This Month</span>
                </div>
                <p className="text-2xl font-bold">{userData.monthlyAnalysesUsed}</p>
                <p className="text-xs text-muted-foreground">analyses performed</p>
              </div>
              <div className="p-4 rounded-xl border bg-background">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Member Since</span>
                </div>
                <p className="text-lg font-bold">{new Date(userData.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleManageSubscription}
                disabled={openingPortal || !userData?.polarCustomerId}
                className="gap-2"
                variant="default"
              >
                {openingPortal ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Opening...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    Manage
                  </>
                )}
              </Button>
              <Button
                onClick={handleSyncSubscription}
                disabled={loading}
                className="gap-2"
                variant="outline"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Sync
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Manage invoices, payment methods, and subscription via Polar.sh
            </p>
          </CardContent>
        </Card>

        {/* Account Card */}
        <Card className="border-muted">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Account</CardTitle>
                <CardDescription>Your account information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-lg">{userData.name || "User"}</p>
                <p className="text-muted-foreground">{userData.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Email</span>
                </div>
                <span className="text-sm font-medium">{userData.email}</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Created</span>
                </div>
                <span className="text-sm font-medium">{new Date(userData.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Status</span>
                </div>
                <Badge variant="default" className="gap-1.5">
                  <CheckCircle2 className="h-3 w-3" />
                  Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications Settings */}
      <Card className="border-muted">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between p-4 rounded-xl border bg-background">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive updates via email</p>
              </div>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className="transition-colors"
              >
                {emailNotifications ? (
                  <ToggleRight className="h-8 w-8 text-primary" />
                ) : (
                  <ToggleLeft className="h-8 w-8 text-muted-foreground" />
                )}
              </button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl border bg-background">
              <div>
                <p className="font-medium">Analysis Reports</p>
                <p className="text-sm text-muted-foreground">Weekly summary of analyses</p>
              </div>
              <button
                onClick={() => setAnalysisReports(!analysisReports)}
                className="transition-colors"
              >
                {analysisReports ? (
                  <ToggleRight className="h-8 w-8 text-primary" />
                ) : (
                  <ToggleLeft className="h-8 w-8 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-900/30">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500" />
            </div>
            <div>
              <CardTitle className="text-red-600 dark:text-red-500">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
            <div>
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
            </div>
            <Button variant="destructive" size="sm">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
