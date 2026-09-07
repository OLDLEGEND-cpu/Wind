'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Simulate reset request or call backend
    await new Promise((resolve) => setTimeout(resolve, 600));
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <div>
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 text-xs text-wind-muted hover:text-wind-text mb-5 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to log in
      </Link>

      <h1 className="text-2xl font-semibold text-wind-text mb-1">Reset password</h1>
      <p className="text-sm text-wind-muted mb-7">
        Enter the email address associated with your account and we&apos;ll send you a password reset link.
      </p>

      {submitted ? (
        <div className="rounded-xl border border-wind-border bg-wind-surface2 p-6 text-center space-y-3">
          <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
          <h3 className="font-semibold text-wind-text">Check your inbox</h3>
          <p className="text-xs text-wind-muted leading-relaxed">
            If an account exists for <strong className="text-wind-text">{email}</strong>, you will receive password reset instructions shortly.
          </p>
          <div className="pt-3">
            <Link
              href={`/reset-password?email=${encodeURIComponent(email)}`}
              className="text-xs font-medium text-wind-accent hover:underline block mb-2"
            >
              Have a reset code / Click here to proceed
            </Link>
            <Link
              href="/login"
              className="text-xs text-wind-muted hover:text-wind-text"
            >
              Return to log in
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="email"
            label="Email address"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" size="lg" loading={loading} className="mt-2 w-full">
            Send reset instructions
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-wind-muted">
        Remember your password?{' '}
        <Link href="/login" className="font-medium text-wind-accent hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
