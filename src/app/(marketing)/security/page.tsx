import { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Server, Database } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Security - ContentLens',
  description: 'How we keep your data secure',
};

export default function SecurityPage() {
  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <h1 className="text-4xl font-bold mb-6">Security</h1>
        <p className="text-muted-foreground mb-8">We take security seriously. Here is how we protect your data.</p>

        <div className="grid gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2">Encryption</h2>
                  <p className="text-muted-foreground">
                    All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Lock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2">Authentication</h2>
                  <p className="text-muted-foreground">
                    We use Clerk for secure authentication with support for 2FA and SSO.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-purple-500/10">
                  <Server className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2">Infrastructure</h2>
                  <p className="text-muted-foreground">
                    Our services run on secure cloud infrastructure with regular security updates.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-orange-500/10">
                  <Database className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2">Data Protection</h2>
                  <p className="text-muted-foreground">
                    Your data is stored in secure PostgreSQL databases with regular backups.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Report a Vulnerability</h2>
            <p className="text-muted-foreground">
              If you believe you have found a security vulnerability, please contact us immediately.
              We appreciate responsible disclosure and will work with you to resolve any issues.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
