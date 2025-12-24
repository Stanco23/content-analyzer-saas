import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">ContentLens</Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
            <Link href="/api-pricing" className="text-gray-600 hover:text-gray-900">API</Link>
            <Link href="/api-docs" className="text-gray-600 hover:text-gray-900">Docs</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/sign-in"><Button variant="ghost">Sign In</Button></Link>
            <Link href="/sign-up"><Button>Get Started</Button></Link>
          </div>
        </div>
      </header>
      <main className="pt-16">{children}</main>
      <footer className="bg-gray-50 border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <p className="text-center text-gray-500">ContentLens - AI-Powered Content Quality Analysis</p>
        </div>
      </footer>
    </div>
  );
}
