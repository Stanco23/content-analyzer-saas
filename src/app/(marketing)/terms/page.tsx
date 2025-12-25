import { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service - ContentLens',
  description: 'Terms and conditions for using ContentLens',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <Card>
          <CardContent className="pt-6 prose prose-sm max-w-none dark:prose-invert">
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing and using ContentLens, you accept and agree to be bound by these Terms of Service.</p>

            <h2>2. Use of Service</h2>
            <p>You agree to use ContentLens only for lawful purposes and in accordance with these Terms.</p>

            <h2>3. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials.</p>

            <h2>4. Subscription and Payments</h2>
            <p>Some features require a paid subscription. All payments are processed securely through our payment provider.</p>

            <h2>5. Limitation of Liability</h2>
            <p>ContentLens is provided "as is" without warranties of any kind.</p>

            <h2>6. Contact</h2>
            <p>For questions about these terms, please contact us.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
