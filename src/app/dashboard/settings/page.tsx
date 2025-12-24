"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface UserData {
  subscriptionTier: string;
  subscriptionStatus: string;
  monthlyAnalysesUsed: number;
  email: string;
  name: string | null;
  createdAt: string;
}

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

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
    try {
      const res = await fetch("/api/polar/portal", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success && data.portalUrl) {
        window.location.href = data.portalUrl;
      }
    } catch (error) {
      console.error("Failed to open customer portal:", error);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user || !userData) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Please sign in to view settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Manage your subscription plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Current Plan</p>
                <p className="text-sm text-muted-foreground">Your active subscription</p>
              </div>
              <Badge variant="default">{userData.subscriptionTier}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Status</p>
                <p className="text-sm text-muted-foreground">Subscription status</p>
              </div>
              <Badge variant={userData.subscriptionStatus === "ACTIVE" ? "default" : "secondary"}>
                {userData.subscriptionStatus}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Monthly Usage</p>
                <p className="text-sm text-muted-foreground">Analyses this month</p>
              </div>
              <span>{userData.monthlyAnalysesUsed}</span>
            </div>
            <div className="pt-4 border-t">
              <Button onClick={handleManageSubscription} className="w-full">
                Manage Subscription
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Powered by Polar.sh
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Your account information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{userData.email}</p>
            </div>
            <div>
              <p className="font-medium">Name</p>
              <p className="text-sm text-muted-foreground">{userData.name || "Not set"}</p>
            </div>
            <div>
              <p className="font-medium">Member Since</p>
              <p className="text-sm text-muted-foreground">{new Date(userData.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
