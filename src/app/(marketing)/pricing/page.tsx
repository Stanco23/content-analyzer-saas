import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { PolarCheckoutButton } from "@/components/payments/polar-checkout-button";

const plans = [
  { name: "Free", price: "$0", period: "/month", analyses: "5 analyses/month", features: ["Basic SEO analysis", "Readability scores", "Email support"], cta: "Get Started", href: "/sign-up" },
  { name: "Pro", price: "$19", period: "/month", analyses: "50 analyses/month", features: ["Advanced SEO analysis", "Keyword suggestions", "Priority support", "Analysis history"], cta: "Subscribe", tier: "PRO", popular: true },
  { name: "Business", price: "$49", period: "/month", analyses: "200 analyses/month", features: ["Everything in Pro", "Team access", "Custom branding", "API access (1K/mo)"], cta: "Subscribe", tier: "BUSINESS" },
];

export default function PricingPage() {
  return (
    <div className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600">Start free, upgrade when you need more.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card key={plan.name} className={plan.popular ? "border-blue-500 border-2 relative" : ""}>
              {plan.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm">Most Popular</span>}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                <CardDescription>{plan.analyses}</CardDescription>
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
                {plan.tier ? (
                  <PolarCheckoutButton tier={plan.tier} className="w-full" variant={plan.popular ? "default" : "outline"}>
                    {plan.cta}
                  </PolarCheckoutButton>
                ) : plan.href ? (
                  <Link href={plan.href}><Button className="w-full" variant={plan.popular ? "default" : "outline"}>{plan.cta}</Button></Link>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
