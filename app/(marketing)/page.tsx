import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck,
  MessageSquare,
  Code2,
  Lock,
  Cpu,
  CheckCircle2,
  Layers,
  ChevronRight
} from 'lucide-react';
import Logo from '@/components/ui/Logo';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-wind-bg text-wind-text selection:bg-indigo-500/20 selection:text-indigo-600">
      {/* Top Announcement Bar */}
      <div className="border-b border-indigo-500/10 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-indigo-500/5 py-2 px-4 text-center text-xs font-medium text-indigo-700 dark:text-indigo-300">
        <span className="inline-flex items-center gap-1.5">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-semibold">Wind 2.5 is live</span> — Experience sub-200ms latency powered by Google Gemini 2.0 Flash.
          <Link href="/register" className="ml-1 underline font-bold hover:opacity-80">
            Try now →
          </Link>
        </span>
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-30 border-b border-wind-border/80 bg-wind-surface/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-wind-muted">
            <a href="#features" className="hover:text-wind-text transition-colors">Features</a>
            <a href="#models" className="hover:text-wind-text transition-colors">Models</a>
            <a href="#security" className="hover:text-wind-text transition-colors">Security</a>
            <Link href="/help" className="hover:text-wind-text transition-colors">Help Center</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2 text-sm font-semibold text-wind-text hover:bg-wind-surface2 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-500/20 hover:from-indigo-700 hover:to-indigo-800 transition-all hover:scale-[1.02]"
            >
              <span>Get started</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-24 text-center px-6">
          {/* Subtle Ambient Background Gradients */}
          <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-indigo-500/15 via-purple-500/10 to-transparent blur-3xl opacity-70" />

          <div className="relative mx-auto max-w-4xl">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-50/70 dark:bg-indigo-950/40 px-4 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              <span>Next-Generation Cognitive Assistant</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-wind-text leading-[1.08] font-sans">
              An AI assistant that <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 bg-clip-text text-transparent">
                thinks alongside you.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-wind-muted leading-relaxed font-normal">
              Wind empowers your writing, engineering, and deep thinking with instant streaming,
              syntax-highlighted code blocks, and a clean, light-first aesthetic built for focus.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 px-7 py-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 hover:from-indigo-700 hover:to-indigo-800 transition-all hover:scale-105"
              >
                <span>Start chatting free</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-wind-border bg-wind-surface px-7 py-3.5 text-sm font-semibold text-wind-text shadow-sm hover:bg-wind-surface2 transition-all"
              >
                <span>Demo Admin Login</span>
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-wind-muted font-medium">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Powered by Gemini 2.0 Flash</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Private Database Isolation</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Free Tier Available</span>
            </div>
          </div>
        </section>

        {/* Live UI Mockup / Showcase */}
        <section className="mx-auto max-w-5xl px-6 pb-28">
          <div className="rounded-3xl border border-wind-border/90 bg-wind-surface p-3 shadow-xl shadow-indigo-500/5">
            <div className="rounded-2xl border border-wind-border bg-wind-surface-2 p-4 sm:p-8">
              {/* Fake Window Controls */}
              <div className="flex items-center justify-between pb-6 border-b border-wind-border mb-6">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-3 text-xs font-semibold text-wind-muted">Wind AI — Workspace</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-wind-surface px-3 py-1 text-xs font-medium text-wind-muted border border-wind-border">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Gemini 2.0 Flash (Wind Fast)</span>
                </div>
              </div>

              {/* Chat Thread Demonstration */}
              <div className="mx-auto max-w-3xl space-y-5">
                <div className="ml-auto max-w-lg rounded-2xl rounded-tr-sm bg-indigo-600 px-4 py-3 text-sm text-white shadow-sm">
                  Write a concise TypeScript repository method for retrieving active user sessions with Redis caching.
                </div>

                <div className="max-w-2xl rounded-2xl rounded-tl-sm border border-wind-border bg-wind-surface p-5 text-sm text-wind-text shadow-sm">
                  <div className="flex items-center gap-2 mb-2 font-semibold text-xs text-indigo-600 dark:text-indigo-400">
                    <Sparkles className="h-3.5 w-3.5" /> Wind Response
                  </div>
                  <p className="text-wind-muted mb-3 text-xs leading-relaxed">
                    Here is a production-grade session lookup with fallback to persistent storage:
                  </p>
                  <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0d1117] text-slate-100 p-3.5 font-mono text-xs leading-relaxed">
                    <span className="text-purple-400">async function</span> <span className="text-blue-400">getSession</span>(sessionId: <span className="text-emerald-400">string</span>) &#123;<br />
                    &nbsp;&nbsp;<span className="text-slate-500">// Check Redis memory cache first</span><br />
                    &nbsp;&nbsp;<span className="text-purple-400">const</span> cached = <span className="text-purple-400">await</span> redis.<span className="text-yellow-400">get</span>(`session:$&#123;sessionId&#125;`);<br />
                    &nbsp;&nbsp;<span className="text-purple-400">if</span> (cached) <span className="text-purple-400">return</span> JSON.<span className="text-yellow-400">parse</span>(cached);<br />
                    <br />
                    &nbsp;&nbsp;<span className="text-purple-400">const</span> session = <span className="text-purple-400">await</span> db.sessions.<span className="text-yellow-400">findUnique</span>(&#123; where: &#123; id: sessionId &#125; &#125;);<br />
                    &nbsp;&nbsp;<span className="text-purple-400">return</span> session;<br />
                    &#125;
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Bento Grid */}
        <section id="features" className="mx-auto max-w-6xl px-6 pb-28">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">
              Engineered For Excellence
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-wind-text">
              Built for speed, accuracy, and flow
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl border border-wind-border bg-wind-surface p-7 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mb-5">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-wind-text mb-2">Token-Level Streaming</h3>
              <p className="text-sm text-wind-muted leading-relaxed">
                Experience instant responses that stream in character by character. No waiting for monolithic completions on a blank page.
              </p>
            </div>

            <div className="rounded-3xl border border-wind-border bg-wind-surface p-7 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mb-5">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-wind-text mb-2">Dynamic Conversations</h3>
              <p className="text-sm text-wind-muted leading-relaxed">
                Edit any previous message to branch conversations. Stop generation mid-thought, regenerate replies, or pin priority threads.
              </p>
            </div>

            <div className="rounded-3xl border border-wind-border bg-wind-surface p-7 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mb-5">
                <Code2 className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-wind-text mb-2">Developer Ergonomics</h3>
              <p className="text-sm text-wind-muted leading-relaxed">
                Fenced code blocks with language indicators, syntax highlighting, and one-click clipboard copying make writing code effortless.
              </p>
            </div>

            <div className="rounded-3xl border border-wind-border bg-wind-surface p-7 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mb-5">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-wind-text mb-2">Zero Model Training</h3>
              <p className="text-sm text-wind-muted leading-relaxed">
                Your chats are your intellectual property. We never train public foundation models on your private conversations or company documents.
              </p>
            </div>

            <div className="rounded-3xl border border-wind-border bg-wind-surface p-7 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mb-5">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-wind-text mb-2">Resilient Persistence</h3>
              <p className="text-sm text-wind-muted leading-relaxed">
                Multi-backend architecture supporting MySQL, Supabase, and local zero-config database storage for 100% availability.
              </p>
            </div>

            <div className="rounded-3xl border border-wind-border bg-wind-surface p-7 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mb-5">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-wind-text mb-2">Admin Telemetry</h3>
              <p className="text-sm text-wind-muted leading-relaxed">
                Real-time API monitoring, user management, audit trails, and token consumption analytics built for enterprise governance.
              </p>
            </div>
          </div>
        </section>

        {/* Model Showcase */}
        <section id="models" className="mx-auto max-w-5xl px-6 pb-28">
          <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-b from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-wind-surface p-8 sm:p-12">
            <div className="text-center max-w-xl mx-auto mb-10">
              <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">Dual Model Intelligence</h2>
              <p className="text-2xl sm:text-3xl font-bold tracking-tight">Choose the right mind for your task</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-wind-border bg-wind-surface p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-lg">Wind Fast</span>
                  <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">Gemini 2.0 Flash</span>
                </div>
                <p className="text-xs text-wind-muted mb-4 leading-relaxed">
                  Best for everyday queries, fast drafting, code explanations, and rapid conversational ideation.
                </p>
                <div className="space-y-2 text-xs text-wind-muted border-t border-wind-border pt-4">
                  <div className="flex justify-between"><span>Speed:</span><strong className="text-wind-text">Ultra-Fast (~150ms TTFT)</strong></div>
                  <div className="flex justify-between"><span>Context:</span><strong className="text-wind-text">Large context window</strong></div>
                  <div className="flex justify-between"><span>Use case:</span><strong className="text-wind-text">Daily productivity & brainstorming</strong></div>
                </div>
              </div>

              <div className="rounded-2xl border border-wind-border bg-wind-surface p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-lg">Wind Pro</span>
                  <span className="rounded-full bg-purple-100 dark:bg-purple-900/30 px-2.5 py-0.5 text-xs font-semibold text-purple-700 dark:text-purple-400">Gemini 1.5 Pro</span>
                </div>
                <p className="text-xs text-wind-muted mb-4 leading-relaxed">
                  Designed for deep reasoning, intricate architectural design, complex debugging, and multi-file analysis.
                </p>
                <div className="space-y-2 text-xs text-wind-muted border-t border-wind-border pt-4">
                  <div className="flex justify-between"><span>Speed:</span><strong className="text-wind-text">Deep reasoning</strong></div>
                  <div className="flex justify-between"><span>Context:</span><strong className="text-wind-text">Massive 1M+ token capacity</strong></div>
                  <div className="flex justify-between"><span>Use case:</span><strong className="text-wind-text">Complex coding & research</strong></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="mx-auto max-w-5xl px-6 pb-24 text-center">
          <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 p-10 sm:p-14 text-white shadow-xl shadow-indigo-600/20">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
              Ready to elevate your everyday thinking?
            </h2>
            <p className="mx-auto max-w-xl text-indigo-100 text-sm sm:text-base leading-relaxed mb-8">
              Join thousands of developers, researchers, and creators using Wind AI for clearer thoughts and faster answers.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-indigo-700 hover:bg-indigo-50 transition-all hover:scale-105 shadow-md"
            >
              Get started free <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-wind-border py-12 bg-wind-surface">
        <div className="mx-auto max-w-6xl px-6 grid gap-8 sm:grid-cols-4 text-xs">
          <div className="space-y-3 sm:col-span-2">
            <Logo />
            <p className="text-wind-muted max-w-sm leading-relaxed">
              Wind AI is an independent, thoughtful cognitive assistant built for thinking, coding, and writing without distractions.
            </p>
            <p className="text-wind-muted">© {new Date().getFullYear()} Wind AI Technologies. All rights reserved.</p>
          </div>
          <div>
            <h4 className="font-semibold text-wind-text mb-3 uppercase tracking-wider text-[11px]">Product</h4>
            <ul className="space-y-2 text-wind-muted">
              <li><Link href="/chat" className="hover:text-wind-text">Chat Workspace</Link></li>
              <li><a href="#models" className="hover:text-wind-text">Model Architecture</a></li>
              <li><Link href="/help" className="hover:text-wind-text">Help & Knowledge Base</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-wind-text mb-3 uppercase tracking-wider text-[11px]">Legal & Trust</h4>
            <ul className="space-y-2 text-wind-muted">
              <li><Link href="/privacy" className="hover:text-wind-text">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-wind-text">Terms of Service</Link></li>
              <li><a href="mailto:support@windai.app" className="hover:text-wind-text">Security Contact</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
