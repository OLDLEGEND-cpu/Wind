'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Wind AI Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-wind-bg flex flex-col items-center justify-between p-6">
      <header className="w-full max-w-5xl flex items-center justify-between py-4">
        <Logo />
      </header>

      <main className="max-w-md text-center py-16">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 text-red-600 shadow-sm">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-red-600 mb-2">
          Something went wrong
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-wind-text mb-3">
          Application Error
        </h1>
        <p className="text-sm text-wind-muted leading-relaxed mb-8">
          Wind encountered an unexpected situation. Your conversations are safely stored in your database.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2"
          >
            <RotateCcw className="h-4 w-4" /> Try Again
          </Button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-wind-border bg-wind-surface px-5 py-2.5 text-sm font-semibold text-wind-text hover:bg-wind-surface2 transition-colors"
          >
            <Home className="h-4 w-4" /> Home
          </Link>
        </div>
      </main>

      <footer className="text-xs text-wind-muted py-4">
        © {new Date().getFullYear()} Wind AI
      </footer>
    </div>
  );
}
