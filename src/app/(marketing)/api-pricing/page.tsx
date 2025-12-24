import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

const apiPlans = [
  { name: "API Starter", price: "$49", requests: "3,000 req/month", features: ["10 req/min", "100 req/day", "Email support", "Basic webhooks"], cta: "Get API Access", href: "/sign-up" },
  { name: "API Growth", price: "$149", requests: "30,000 req/month", features: ["60 req/min", "1,000 req/day", "Priority support", "Advanced webhooks", "IP whitelisting"], cta: "Get API Access", href: "/sign-up", popular: true },
  { name: "API Enterprise", price: "$499", requests: "300,000 req/month", features: ["300 req/min", "10,000 req/day", "Dedicated support", "SLA guarantee", "Custom integrations"], cta: "Contact Sales", href: "/sign-up" },
];

export default function ApiPricingPage() {
  return (
    <div className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Developer API Pricing</h1>
          <p className="text-xl text-gray-600">Build powerful integrations with our content analysis API.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {apiPlans.map((plan) => (
            <Card key={plan.name} className={plan.popular ? "border-blue-500 border-2 relative" : ""}>
              {plan.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm">Most Popular</span>}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <CardDescription>{plan.requests}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.href}><Button className="w-full" variant={plan.popular ? "default" : "outline"}>{plan.cta}</Button></Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
