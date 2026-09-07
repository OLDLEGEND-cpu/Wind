'use client';

import { useState, FormEvent, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { CheckCircle2 } from 'lucide-react';

function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const defaultEmail = params.get('email') || '';

  const [email, setEmail] = useState(defaultEmail);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to reset password.');
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-wind-border bg-wind-surface2 p-6 text-center space-y-3">
        <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
        <h3 className="font-semibold text-wind-text">Password updated</h3>
        <p className="text-xs text-wind-muted">
          Your password has been changed successfully. Redirecting you to login...
        </p>
        <div className="pt-2">
          <Link href="/login" className="text-xs font-semibold text-wind-accent hover:underline">
            Click here if you are not redirected
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        id="email"
        label="Email address"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        id="newPassword"
        label="New password"
        type="password"
        autoComplete="new-password"
        required
        placeholder="Min. 8 characters"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <Input
        id="confirmPassword"
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        required
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      {error && (
        <p className="text-sm text-wind-danger bg-wind-danger/10 rounded-lg px-3 py-2">{error}</p>
      )}

      <Button type="submit" size="lg" loading={loading} className="mt-2 w-full">
        Update password
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-wind-text mb-1">Set new password</h1>
      <p className="text-sm text-wind-muted mb-7">Choose a secure password for your Wind AI account.</p>

      <Suspense fallback={<div className="h-64 rounded-xl bg-wind-surface animate-pulse" />}>
        <ResetPasswordForm />
      </Suspense>

      <p className="mt-6 text-center text-sm text-wind-muted">
        Remember your password?{' '}
        <Link href="/login" className="font-medium text-wind-accent hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
