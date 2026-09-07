'use client';

import { useState } from 'react';
import { Menu, Plus, Zap, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import ConversationsProvider, { useConversations } from './ConversationsProvider';
import Logo from '@/components/ui/Logo';
import { useAuth } from '@/components/layout/AuthProvider';
import ThemeToggle from '@/components/layout/ThemeToggle';

function TopBar({ onOpenMobile }: { onOpenMobile: () => void }) {
  const { createConversation } = useConversations();
  const router = useRouter();

  async function handleNew() {
    const conv = await createConversation();
    if (conv) router.push(`/chat/${conv.id}`);
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-wind-border bg-wind-surface/80 backdrop-blur-md px-4 sm:px-6 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg text-wind-muted hover:text-wind-text hover:bg-wind-surface2 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="md:hidden">
          <Logo size={20} />
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-50/60 dark:bg-indigo-950/40 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            <Zap className="h-3 w-3 text-indigo-500" />
            <span>Wind AI • Powered by Gemini</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] text-wind-muted font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            Isolated & Private
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleNew}
          className="inline-flex items-center gap-1.5 rounded-xl border border-wind-border bg-wind-surface hover:bg-wind-surface2 px-3 py-1.5 text-xs font-medium text-wind-text transition-colors shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">New Thread</span>
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}

export default function ChatShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-wind-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="h-7 w-7 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <p className="text-xs text-wind-muted font-medium">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <ConversationsProvider>
      <div className="flex h-screen overflow-hidden bg-wind-bg">
        <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
        <div className="flex flex-1 flex-col min-w-0">
          <TopBar onOpenMobile={() => setMobileOpen(true)} />
          <div className="flex-1 min-h-0">{children}</div>
        </div>
      </div>
    </ConversationsProvider>
  );
}
