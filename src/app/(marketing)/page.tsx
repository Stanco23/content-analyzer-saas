import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Zap, Shield, BarChart } from "lucide-react";

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="py-20 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">AI-Powered Content Quality Analysis</h1>
          <p className="text-xl text-gray-600 mb-8">
            Analyze your content for SEO, readability, and quality. Get actionable insights to improve your writing and rank higher.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/sign-up"><Button size="lg">Start Free</Button></Link>
            <Link href="/api-docs"><Button size="lg" variant="outline">View API Docs</Button></Link>
          </div>
          <p className="mt-4 text-sm text-gray-500">No credit card required. 5 free analyses per month.</p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Everything You Need</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: BarChart, title: "SEO Analysis", desc: "Keyword density, title optimization, and meta suggestions" },
              { icon: Zap, title: "Readability Score", desc: "Flesch score, grade level, and sentence analysis" },
              { icon: CheckCircle, title: "Actionable Suggestions", desc: "Get specific improvements to boost your content" },
              { icon: Shield, title: "Developer API", desc: "REST API with rate limiting and webhooks" },
            ].map((f, i) => (
              <Card key={i}>
                <CardHeader>
                  <f.icon className="w-10 h-10 text-blue-500 mb-2" />
                  <CardTitle>{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{f.desc}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Improve Your Content?</h2>
          <p className="text-xl mb-8 text-blue-100">Join thousands of content creators using AI to write better.</p>
          <Link href="/sign-up"><Button size="lg" variant="secondary">Get Started Free</Button></Link>
        </div>
      </section>
    </div>
  );
}
