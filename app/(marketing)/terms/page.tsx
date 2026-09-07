import Link from 'next/link';
import { ArrowLeft, Scale, CheckCircle2, AlertCircle } from 'lucide-react';
import Logo from '@/components/ui/Logo';

export default function TermsPage() {
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
            <Scale className="h-3.5 w-3.5" /> Legal & Terms of Service
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Terms of Service</h1>
          <p className="mt-3 text-wind-muted text-sm sm:text-base">
            Effective date: September 7, 2026. Please read these terms carefully before using Wind AI.
          </p>
        </div>

        <div className="space-y-8 rounded-2xl border border-wind-border bg-wind-surface p-6 sm:p-10 shadow-sm leading-relaxed text-sm sm:text-base">
          <section>
            <h2 className="text-lg font-semibold text-wind-text mb-3">1. Acceptance of Terms</h2>
            <p className="text-wind-muted">
              By accessing or using the Wind AI platform, APIs, web interfaces, and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the service.
            </p>
          </section>

          <section className="border-t border-wind-border pt-6">
            <h2 className="text-lg font-semibold text-wind-text mb-3">2. Permitted Use & Conduct</h2>
            <p className="text-wind-muted mb-2">
              You agree to use Wind AI responsibly. You may not use the service:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-wind-muted">
              <li>To generate harmful, abusive, defamatory, deceptive, or illegal content.</li>
              <li>To attempt unauthorized access, reverse-engineer, or overload our API servers and database infrastructures.</li>
              <li>To circumvent rate limits or authentication security protections.</li>
            </ul>
          </section>

          <section className="border-t border-wind-border pt-6">
            <div className="flex items-center gap-2 text-lg font-semibold text-wind-text mb-3">
              <CheckCircle2 className="h-5 w-5 text-wind-accent" />
              <h2>3. Content Ownership & Rights</h2>
            </div>
            <p className="text-wind-muted">
              As between you and Wind AI, you own the prompts, inputs, and instructions you submit to the service. Wind AI grants you full commercial and non-commercial ownership and usage rights in the generated responses produced for you, subject to compliance with these terms and applicable laws.
            </p>
          </section>

          <section className="border-t border-wind-border pt-6">
            <div className="flex items-center gap-2 text-lg font-semibold text-wind-text mb-3">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <h2>4. AI Output Disclaimer</h2>
            </div>
            <p className="text-wind-muted">
              AI outputs are probabilistic generation based on machine learning models. Wind AI strives for high accuracy and precision, but outputs may occasionally contain errors, hallucinated facts, or unexpected code bugs. You should independently verify code, medical, legal, or financial advice before relying on it.
            </p>
          </section>

          <section className="border-t border-wind-border pt-6">
            <h2 className="text-lg font-semibold text-wind-text mb-3">5. Termination & Inquiries</h2>
            <p className="text-wind-muted">
              We reserve the right to suspend or terminate accounts that violate our terms or abuse system resources. For questions or legal notices, contact{' '}
              <a href="mailto:legal@windai.app" className="text-wind-accent underline hover:opacity-80">
                legal@windai.app
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
