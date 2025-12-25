"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Sparkles, Building2, Shield, CreditCard, HelpCircle, ArrowRight } from "lucide-react";
import { PolarCheckoutButton } from "@/components/payments/polar-checkout-button";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Perfect for trying out ContentLens",
    icon: Zap,
    features: [
      "5 analyses per month",
      "Basic SEO analysis",
      "Readability scores",
      "Email support",
      "7-day analysis history",
    ],
    cta: "Get Started",
    href: "/sign-up",
    popular: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For content creators and marketers who need more",
    icon: Sparkles,
    features: [
      "50 analyses per month",
      "Advanced SEO analysis",
      "Keyword suggestions",
      "Priority email support",
      "Unlimited analysis history",
      "Export reports (PDF)",
      "Content suggestions",
    ],
    cta: "Subscribe Now",
    tier: "PRO",
    popular: true,
  },
  {
    name: "Business",
    price: "$49",
    period: "/month",
    description: "For teams and agencies with advanced needs",
    icon: Building2,
    features: [
      "200 analyses per month",
      "Everything in Pro",
      "Team access (up to 5 users)",
      "Custom branding",
      "API access (1,000 calls/mo)",
      "Webhook integrations",
      "Dedicated support",
      "SSO authentication",
    ],
    cta: "Subscribe Now",
    tier: "BUSINESS",
    popular: false,
  },
];

const comparisonFeatures = [
  { name: "Monthly Analyses", free: "5", pro: "50", business: "200" },
  { name: "SEO Analysis", free: "Basic", pro: "Advanced", business: "Advanced +" },
  { name: "Readability Scores", free: true, pro: true, business: true },
  { name: "Keyword Suggestions", free: false, pro: true, business: true },
  { name: "Analysis History", free: "7 days", pro: "Unlimited", business: "Unlimited" },
  { name: "PDF Exports", free: false, pro: true, business: true },
  { name: "Team Members", free: "1", pro: "1", business: "Up to 5" },
  { name: "API Access", free: false, pro: false, business: "1,000 calls/mo" },
  { name: "Webhooks", free: false, pro: false, business: true },
  { name: "Custom Branding", free: false, pro: false, business: true },
  { name: "Priority Support", free: false, pro: true, business: true },
  { name: "SSO Authentication", free: false, pro: false, business: true },
];

const faqs = [
  {
    question: "Can I change plans anytime?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and are prorated.",
  },
  {
    question: "What happens if I exceed my monthly analyses?",
    answer: "You can purchase additional analyses at the pay-as-you-go rate, or upgrade to a higher plan for more credits.",
  },
  {
    question: "Is there a free trial for paid plans?",
    answer: "Yes, all paid plans come with a 14-day free trial. No credit card required to start.",
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 30-day money-back guarantee for all paid subscriptions. Contact support for assistance.",
  },
  {
    question: "Can I cancel my subscription?",
    answer: "Yes, you can cancel anytime from your account settings. You'll continue to have access until the end of your billing period.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express) and PayPal through our payment processor Polar.sh.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4">
              Pricing
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-muted-foreground">
              Choose the plan that fits your needs. Start free, upgrade when you are ready.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative flex flex-col transition-all duration-300 hover:shadow-xl ${
                  plan.popular
                    ? "border-primary shadow-lg scale-105 z-10"
                    : "border-muted hover:shadow-lg"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 px-3 py-1">
                      <Sparkles className="h-3.5 w-3.5" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <div className={`w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center ${
                    plan.popular ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}>
                    <plan.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="text-center mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-6 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {plan.tier ? (
                    <PolarCheckoutButton
                      tier={plan.tier}
                      className="w-full"
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.cta}
                    </PolarCheckoutButton>
                  ) : plan.href ? (
                    <Link href={plan.href}>
                      <Button
                        className="w-full"
                        variant={plan.popular ? "default" : "outline"}
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Feature Comparison Table */}
          <div className="mb-20">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Compare Features</h2>
              <p className="text-muted-foreground">See exactly what is included in each plan</p>
            </div>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="text-left py-4 px-6 font-semibold">Feature</th>
                      <th className="text-center py-4 px-6 font-semibold">Free</th>
                      <th className="text-center py-4 px-6 font-semibold">Pro</th>
                      <th className="text-center py-4 px-6 font-semibold">Business</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((feature, i) => (
                      <tr key={i} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-6">{feature.name}</td>
                        <td className="text-center py-4 px-6">
                          {typeof feature.free === "boolean" ? (
                            feature.free ? (
                              <Check className="h-5 w-5 text-emerald-500 mx-auto" />
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )
                          ) : (
                            <span className="text-sm">{feature.free}</span>
                          )}
                        </td>
                        <td className="text-center py-4 px-6">
                          {typeof feature.pro === "boolean" ? (
                            feature.pro ? (
                              <Check className="h-5 w-5 text-emerald-500 mx-auto" />
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )
                          ) : (
                            <span className="text-sm font-medium">{feature.pro}</span>
                          )}
                        </td>
                        <td className="text-center py-4 px-6">
                          {typeof feature.business === "boolean" ? (
                            feature.business ? (
                              <Check className="h-5 w-5 text-emerald-500 mx-auto" />
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )
                          ) : (
                            <span className="text-sm font-medium">{feature.business}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Trust Badges */}
          <div className="mb-20">
            <div className="rounded-2xl bg-muted/50 p-8 md:p-12">
              <div className="grid md:grid-cols-3 gap-8 items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Secure Payments</p>
                    <p className="text-sm text-muted-foreground">Powered by Polar.sh</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Cancel Anytime</p>
                    <p className="text-sm text-muted-foreground">No hidden fees</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <HelpCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">30-Day Guarantee</p>
                    <p className="text-sm text-muted-foreground">Full refund policy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">Got questions? We have answers.</p>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <Card key={i} className="border-muted">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border p-8 md:p-12">
              <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Our team is here to help you find the right plan for your needs.
              </p>
              <Link href="/contact">
                <Button variant="outline" className="gap-2">
                  Contact Sales
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
