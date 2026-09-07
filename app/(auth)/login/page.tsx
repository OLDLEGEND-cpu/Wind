'use client';

import { useState, FormEvent, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }
      const next = params.get('next') || (data.user.role === 'admin' ? '/admin' : '/chat');
      router.push(next);
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="password" className="text-sm font-medium text-wind-text">Password</label>
          <Link href="/forgot-password" className="text-xs text-wind-accent hover:underline">
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          label=""
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && (
        <p className="text-sm text-wind-danger bg-wind-danger/10 rounded-lg px-3 py-2">{error}</p>
      )}
      <Button type="submit" size="lg" loading={loading} className="mt-1 w-full">
        Log in
      </Button>

      <div className="relative my-2 text-center text-xs text-wind-muted">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-wind-border"></div></div>
        <span className="relative bg-wind-surface px-2 text-wind-muted">or quick start</span>
      </div>

      <button
        type="button"
        onClick={() => {
          setEmail('admin@windai.app');
          setPassword('ChangeMe123!');
        }}
        className="w-full rounded-xl border border-dashed border-wind-border py-2 text-xs font-medium text-wind-muted hover:text-wind-text hover:border-wind-accent hover:bg-wind-surface2 transition-all"
      >
        Use Admin Demo (admin@windai.app)
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-wind-text mb-1">Welcome back</h1>
      <p className="text-sm text-wind-muted mb-7">Log in to continue your conversations.</p>

      <Suspense fallback={<div className="h-64 rounded-xl bg-wind-surface animate-pulse" />}>
        <LoginForm />
      </Suspense>

      <p className="mt-6 text-center text-sm text-wind-muted">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-medium text-wind-accent hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
