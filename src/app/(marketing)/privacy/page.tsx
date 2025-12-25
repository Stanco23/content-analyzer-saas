import { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy - ContentLens',
  description: 'How we protect and use your data',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <Card>
          <CardContent className="pt-6 prose prose-sm max-w-none dark:prose-invert">
            <h2>1. Introduction</h2>
            <p>Welcome to ContentLens. We respect your privacy and are committed to protecting your personal data.</p>

            <h2>2. Data We Collect</h2>
            <p>We collect information you provide when using our services, including content you analyze and account information.</p>

            <h2>3. How We Use Your Data</h2>
            <p>We use your data to provide and improve our content analysis services.</p>

            <h2>4. Data Security</h2>
            <p>We implement appropriate security measures to protect your data.</p>

            <h2>5. Contact Us</h2>
            <p>If you have questions about this Privacy Policy, please contact us.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
