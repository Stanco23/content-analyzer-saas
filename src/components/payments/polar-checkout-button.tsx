"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface PolarCheckoutButtonProps {
  tier: string;
  children: React.ReactNode;
  variant?: "default" | "outline";
  className?: string;
}

export function PolarCheckoutButton({ tier, children, variant = "default", className }: PolarCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/polar/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tier }),
      });

      const data = await res.json();

      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        console.error("Checkout failed:", data.error, data.details);
        alert(`Checkout failed: ${data.error || 'Unknown error'}\n${data.details || ''}`);
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant={variant} onClick={handleCheckout} disabled={loading} className={className}>
      {loading ? "Loading..." : children}
    </Button>
  );
}
