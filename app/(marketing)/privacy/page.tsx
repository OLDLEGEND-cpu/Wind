import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Eye, FileText } from 'lucide-react';
import Logo from '@/components/ui/Logo';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-wind-bg text-wind-text">
      <header className="border-b border-wind-border bg-wind-surface/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Logo />
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-wind-muted hover:text-wind-text transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-wind-border bg-wind-surface px-3 py-1 text-xs font-medium text-wind-accent mb-4">
            <Shield className="h-3.5 w-3.5" /> Privacy & Data Protection
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Wind AI Privacy Policy</h1>
          <p className="mt-3 text-wind-muted text-sm sm:text-base">
            Last updated: September 7, 2026. Your privacy and intellectual property are our highest priorities.
          </p>
        </div>

        <div className="space-y-8 rounded-2xl border border-wind-border bg-wind-surface p-6 sm:p-10 shadow-sm leading-relaxed text-sm sm:text-base">
          <section>
            <div className="flex items-center gap-2 text-lg font-semibold text-wind-text mb-3">
              <Lock className="h-5 w-5 text-wind-accent" />
              <h2>1. Information We Collect</h2>
            </div>
            <p className="text-wind-muted mb-2">
              We collect information to provide, maintain, and improve our AI conversation services:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-wind-muted">
              <li><strong className="text-wind-text">Account Information:</strong> Your name, email address, hashed passwords, and profile preferences when you register.</li>
              <li><strong className="text-wind-text">Conversation Data:</strong> Prompts, queries, and assistant replies stored in your account history to allow conversation continuation and continuity.</li>
              <li><strong className="text-wind-text">Technical Data:</strong> IP address, device telemetry, access timestamps, and error logs for security auditing and rate-limiting enforcement.</li>
            </ul>
          </section>

          <section className="border-t border-wind-border pt-6">
            <div className="flex items-center gap-2 text-lg font-semibold text-wind-text mb-3">
              <Eye className="h-5 w-5 text-wind-accent" />
              <h2>2. How We Use Your Data</h2>
            </div>
            <p className="text-wind-muted mb-2">
              Your data is processed strictly to deliver your assistant experience:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-wind-muted">
              <li>To provide, personalize, and stream real-time conversational responses.</li>
              <li>To maintain account security, prevent abuse, and enforce rate limits.</li>
              <li><strong className="text-wind-text">No Model Training:</strong> We do NOT sell your conversations or use your private conversations to train foundational public models without your explicit consent.</li>
            </ul>
          </section>

          <section className="border-t border-wind-border pt-6">
            <div className="flex items-center gap-2 text-lg font-semibold text-wind-text mb-3">
              <FileText className="h-5 w-5 text-wind-accent" />
              <h2>3. Security & Retention</h2>
            </div>
            <p className="text-wind-muted">
              All credentials are cryptographically hashed using salted bcrypt algorithms. Authentication sessions are encrypted via signed JWT tokens stored in HTTP-only, secure cookies. You can delete individual chats or your entire conversation history at any time from your account settings.
            </p>
          </section>

          <section className="border-t border-wind-border pt-6">
            <h2 className="text-lg font-semibold text-wind-text mb-3">4. Contacting Us</h2>
            <p className="text-wind-muted">
              If you have any questions or data requests regarding this Privacy Policy, reach out to our privacy compliance team at{' '}
              <a href="mailto:privacy@windai.app" className="text-wind-accent underline hover:opacity-80">
                privacy@windai.app
              </a>.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-wind-border py-8 text-center text-xs text-wind-muted">
        © {new Date().getFullYear()} Wind AI Technologies Inc. All rights reserved.
      </footer>
    </div>
  );
}
