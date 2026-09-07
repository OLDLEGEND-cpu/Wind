import Link from 'next/link';
import { ArrowLeft, MessageSquare, Compass } from 'lucide-react';
import Logo from '@/components/ui/Logo';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-wind-bg flex flex-col items-center justify-between p-6">
      <header className="w-full max-w-5xl flex items-center justify-between py-4">
        <Logo />
        <Link
          href="/"
          className="text-xs font-medium text-wind-muted hover:text-wind-text transition-colors"
        >
          Home
        </Link>
      </header>

      <main className="max-w-md text-center py-16">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-wind-border bg-wind-surface text-wind-accent shadow-sm">
          <Compass className="h-8 w-8" />
        </div>
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-wind-accent mb-2">
          404 Error
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-wind-text mb-3">
          Page not found
        </h1>
        <p className="text-sm text-wind-muted leading-relaxed mb-8">
          The page or conversation you are looking for doesn&apos;t exist, has been removed, or is temporarily unavailable.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/chat"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-wind-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-wind-accentHover transition-colors shadow-sm"
          >
            <MessageSquare className="h-4 w-4" /> Go to Chat
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-wind-border bg-wind-surface px-5 py-2.5 text-sm font-semibold text-wind-text hover:bg-wind-surface2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Return Home
          </Link>
        </div>
      </main>

      <footer className="text-xs text-wind-muted py-4">
        © {new Date().getFullYear()} Wind AI
      </footer>
    </div>
  );
}
