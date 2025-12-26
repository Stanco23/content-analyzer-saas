import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { PolarCheckoutButton } from "@/components/payments/polar-checkout-button";
import Link from "next/link";

const apiPlans = [
  {
    name: "API Starter",
    price: "$49",
    period: "/month",
    description: "Perfect for small-scale integrations",
    requests: "3,000 API calls/month",
    features: [
      "10 requests/minute rate limit",
      "100 requests/day burst",
      "Email support",
      "Basic webhooks",
      "Standard API access",
    ],
    cta: "Get API Access",
    tier: "API_STARTER",
    popular: false,
  },
  {
    name: "API Growth",
    price: "$149",
    period: "/month",
    description: "For growing applications and services",
    requests: "30,000 API calls/month",
    features: [
      "60 requests/minute rate limit",
      "1,000 requests/day burst",
      "Priority email support",
      "Advanced webhooks",
      "IP whitelisting",
      "Higher throughput",
    ],
    cta: "Get API Access",
    tier: "API_GROWTH",
    popular: true,
  },
  {
    name: "API Enterprise",
    price: "$499",
    period: "/month",
    description: "For high-volume production workloads",
    requests: "300,000 API calls/month",
    features: [
      "300 requests/minute rate limit",
      "10,000 requests/day burst",
      "Dedicated support channel",
      "SLA guarantee (99.9%)",
      "Custom integrations",
      "Account manager",
    ],
    cta: "Contact Sales",
    tier: null,
    popular: false,
    contact: true,
  },
];

export default function ApiPricingPage() {
  return (
    <div className="py-20 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Developer API Pricing</h1>
          <p className="text-xl text-muted-foreground">
            Build powerful integrations with our content analysis API.
          </p>
          <div className="mt-4">
            <Link href="/docs" className="text-primary hover:underline">
              View API Documentation &rarr;
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {apiPlans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col ${
                plan.popular ? "border-primary shadow-lg scale-105" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-2 text-sm font-medium text-primary">
                  {plan.requests}
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 mb-6 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.contact ? (
                  <Button className="w-full" variant="outline" asChild>
                    <a href="mailto:sales@contentlens.dev">Contact Sales</a>
                  </Button>
                ) : (
                  <PolarCheckoutButton
                    tier={plan.tier!}
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                  </PolarCheckoutButton>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Need a custom solution?</h2>
          <p className="text-muted-foreground mb-6">
            For high-volume requirements or special integrations, we offer custom enterprise plans.
          </p>
          <Button variant="outline" asChild>
            <a href="mailto:sales@contentlens.dev">Talk to Sales</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
