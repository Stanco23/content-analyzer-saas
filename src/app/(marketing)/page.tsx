import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  Zap,
  BarChart,
  Brain,
  Target,
  Code2,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Shield,
  Users,
  Clock
} from "lucide-react";

const features = [
  {
    icon: BarChart,
    title: "SEO Analysis",
    description: "Comprehensive keyword density analysis, title optimization, meta suggestions, and structured data validation for better search visibility.",
    color: "blue",
  },
  {
    icon: Brain,
    title: "Readability Scores",
    description: "Flesch-Kincaid scoring, grade level analysis, and sentence structure recommendations to keep readers engaged.",
    color: "purple",
  },
  {
    icon: Target,
    title: "Actionable Suggestions",
    description: "Get specific, prioritized recommendations to improve your content quality, tone, and structure.",
    color: "emerald",
  },
  {
    icon: Code2,
    title: "Developer API",
    description: "RESTful API with webhooks, rate limiting, and comprehensive documentation for seamless integration.",
    color: "orange",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Paste Your Content",
    description: "Simply paste your article, blog post, or any text content into the analyzer.",
  },
  {
    step: "02",
    title: "AI Analysis",
    description: "Our advanced AI models analyze readability, SEO factors, and content structure in seconds.",
  },
  {
    step: "03",
    title: "Get Recommendations",
    description: "Receive actionable suggestions to improve your content quality and search rankings.",
  },
];

const stats = [
  { value: "50K+", label: "Content Analyzed", icon: BarChart },
  { value: "10K+", label: "Happy Users", icon: Users },
  { value: "99.9%", label: "Uptime", icon: Shield },
  { value: "<2s", label: "Avg. Analysis Time", icon: Clock },
];

const testimonials = [
  {
    quote: "ContentLens transformed how we approach content creation. Our blog traffic increased by 40% in just two months.",
    author: "Sarah Chen",
    role: "Content Director",
    company: "TechStartup Inc.",
  },
  {
    quote: "The API is rock-solid and the suggestions are incredibly actionable. A must-have for any content team.",
    author: "Marcus Johnson",
    role: "CTO",
    company: "MediaFlow",
  },
];

const faqs = [
  {
    question: "How accurate is the analysis?",
    answer: "Our AI models are trained on millions of high-performing content pieces, achieving over 95% accuracy in identifying improvement areas.",
  },
  {
    question: "Can I analyze content in languages other than English?",
    answer: "Yes! We currently support 12 languages including English, Spanish, French, German, Portuguese, and Japanese.",
  },
  {
    question: "Is there a free tier?",
    answer: "Absolutely. We offer 5 free analyses every month with no credit card required. Perfect for trying out the platform.",
  },
  {
    question: "How does the API pricing work?",
    answer: "Our API uses a simple per-request pricing model. You only pay for what you use, with volume discounts available for enterprise customers.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in">
              <Sparkles className="h-4 w-4" />
              AI-Powered Content Analysis
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
              Analyze Your Content with{" "}
              <span className="text-primary">AI Precision</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
              Get comprehensive SEO analysis, readability scores, and actionable suggestions
              to improve your content quality and search rankings in seconds.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link href="/sign-up">
                <Button size="lg" className="gap-2 w-full sm:w-auto h-12 px-8">
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/api-docs">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-6">
                  View API Docs
                </Button>
              </Link>
            </div>

            <p className="text-sm text-muted-foreground">
              No credit card required. 5 free analyses every month.
            </p>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
            <div className="rounded-xl border bg-card shadow-2xl overflow-hidden mx-auto max-w-5xl">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="ml-4 text-sm text-muted-foreground font-mono bg-muted/50 px-3 py-1 rounded">
                  contentlens.vssh.dev/dashboard
                </div>
              </div>

              {/* Dashboard mock content */}
              <div className="p-6 bg-gradient-to-br from-muted/20 to-muted/5">
                <div className="grid gap-4 md:grid-cols-4">
                  {[
                    { label: "SEO Score", value: "87", trend: "+12%", trendUp: true },
                    { label: "Readability", value: "92", trend: "+5%", trendUp: true },
                    { label: "Word Count", value: "1,247", trend: "Good" },
                    { label: "Grade Level", value: "8.2", trend: "Easy" },
                  ].map((stat, i) => (
                    <div key={i} className="p-4 rounded-xl bg-background border shadow-sm hover:shadow-md transition-shadow">
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <div className="flex items-end justify-between mt-2">
                        <p className="text-3xl font-bold">{stat.value}</p>
                        {stat.trendUp !== undefined && (
                          <span className={`text-sm font-medium ${stat.trendUp ? "text-emerald-600" : "text-red-600"}`}>
                            {stat.trend}
                          </span>
                        )}
                        {stat.trend === "Good" || stat.trend === "Easy" ? (
                          <span className="text-sm font-medium text-emerald-600">{stat.trend}</span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mock chart area */}
                <div className="mt-6 h-48 rounded-xl bg-muted/30 border border-dashed flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Content quality trend chart</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-28 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need for Content Excellence
            </h2>
            <p className="text-lg text-muted-foreground">
              Powerful tools to analyze, optimize, and improve your content for better engagement and rankings.
            </p>
          </div>

          {/* Features grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <Card
                key={i}
                className="group hover:shadow-lg transition-all duration-300 border-muted hover:border-primary/20"
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
                    feature.color === "blue" ? "bg-blue-500/10 text-blue-600" :
                    feature.color === "purple" ? "bg-purple-500/10 text-purple-600" :
                    feature.color === "emerald" ? "bg-emerald-500/10 text-emerald-600" :
                    "bg-orange-500/10 text-orange-600"
                  }`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground">
              Get insights in three simple steps. No complex setup required.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((item, i) => (
              <div key={i} className="relative text-center">
                {/* Connection line */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-px bg-border" />
                )}
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground font-bold text-xl mb-6 shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 lg:py-20 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <stat.icon className="h-8 w-8 mb-3 opacity-80" />
                <div className="text-3xl md:text-4xl font-bold">{stat.value}</div>
                <div className="text-primary-foreground/80 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by Content Teams</h2>
            <p className="text-lg text-muted-foreground">
              See what our customers are saying about ContentLens.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((testimonial, i) => (
              <Card key={i} className="border-muted">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Sparkles key={j} className="h-4 w-4 text-amber-500 fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-lg mb-6 leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {testimonial.author.split(" ").map(n => n[0]).join("")}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}, {testimonial.company}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 lg:py-28 bg-muted/30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">
              Have questions? We have answers.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <Card key={i} className="border-muted">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    {faq.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Improve Your Content?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of content creators, marketers, and developers who use ContentLens
              to create better content that ranks higher and engages readers.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/sign-up">
                <Button size="lg" className="gap-2 w-full sm:w-auto h-12 px-8">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-6">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
