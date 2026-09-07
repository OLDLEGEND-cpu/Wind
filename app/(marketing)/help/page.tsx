import Link from 'next/link';
import { ArrowLeft, HelpCircle, MessageSquare, Key, Sparkles, Sliders, Mail } from 'lucide-react';
import Logo from '@/components/ui/Logo';

export default function HelpPage() {
  const faqs = [
    {
      q: 'How do I connect my Google Gemini API key?',
      a: 'Add your key to the `.env.local` file as `GEMINI_API_KEY=your_key_here` and restart the server. Wind AI reads this environment variable directly on the server without ever exposing it to client browsers.'
    },
    {
      q: 'What AI models are supported in Wind AI?',
      a: 'Wind AI supports Gemini 2.0 Flash (Wind Fast) for high-speed responsiveness, and Gemini 1.5 Pro (Wind Pro) for complex analysis, coding, and multi-turn deep reasoning.'
    },
    {
      q: 'Can I stop generation mid-response?',
      a: 'Yes! While Wind is streaming an answer, click the red "Stop" button in the prompt bar to immediately halt the stream. The generated portion will be saved in your conversation.'
    },
    {
      q: 'Can I edit previous messages?',
      a: 'Yes, hover over any user message in the chat and click the pencil "Edit" icon. You can modify your prompt, and Wind will automatically regenerate the response from that point onward.'
    },
    {
      q: 'How are conversations persisted?',
      a: 'Conversations and messages are safely stored in your database (MySQL, Supabase, or local persistent store). You can rename, pin, search, or delete any thread from the sidebar.'
    },
    {
      q: 'How do I access the Admin Dashboard?',
      a: 'Users with the "admin" role (such as the default bootstrapped administrator admin@windai.app) have access to the `/admin` portal for user management, system audit logs, and API usage analytics.'
    }
  ];

  return (
    <div className="min-h-screen bg-wind-bg text-wind-text">
      <header className="border-b border-wind-border bg-wind-surface/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Logo />
          <div className="flex items-center gap-4">
            <Link
              href="/chat"
              className="rounded-lg bg-wind-accent px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-wind-accentHover transition-colors"
            >
              Open Chat
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-wind-muted hover:text-wind-text transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Home
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-wind-border bg-wind-surface px-3.5 py-1 text-xs font-medium text-wind-accent mb-4">
            <HelpCircle className="h-3.5 w-3.5" /> Help Center & Knowledge Base
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">How can we help you?</h1>
          <p className="mt-3 text-wind-muted text-sm sm:text-base max-w-lg mx-auto">
            Everything you need to know about navigating Wind AI, managing chats, configuring models, and customization.
          </p>
        </div>

        {/* Quick Feature Guides */}
        <div className="grid gap-4 sm:grid-cols-3 mb-12">
          <div className="rounded-2xl border border-wind-border bg-wind-surface p-5">
            <Sparkles className="h-5 w-5 text-wind-accent mb-2.5" />
            <h3 className="font-semibold text-sm mb-1">Streaming Responses</h3>
            <p className="text-xs text-wind-muted leading-relaxed">
              Get real-time token streaming with formatted Markdown, highlighted code snippets, and quick copy actions.
            </p>
          </div>
          <div className="rounded-2xl border border-wind-border bg-wind-surface p-5">
            <Sliders className="h-5 w-5 text-wind-accent mb-2.5" />
            <h3 className="font-semibold text-sm mb-1">Custom Instructions</h3>
            <p className="text-xs text-wind-muted leading-relaxed">
              Set your system persona, tone, and formatting preferences in Account Settings to personalize all future responses.
            </p>
          </div>
          <div className="rounded-2xl border border-wind-border bg-wind-surface p-5">
            <Key className="h-5 w-5 text-wind-accent mb-2.5" />
            <h3 className="font-semibold text-sm mb-1">Secure Auth & Storage</h3>
            <p className="text-xs text-wind-muted leading-relaxed">
              Enterprise-grade session management with bcrypt hashing, rate limiting, and private conversation isolation.
            </p>
          </div>
        </div>

        {/* FAQs */}
        <div className="rounded-2xl border border-wind-border bg-wind-surface p-6 sm:p-10 shadow-sm">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-wind-accent" /> Frequently Asked Questions
          </h2>
          <div className="divide-y divide-wind-border">
            {faqs.map((faq, i) => (
              <div key={i} className="py-5 first:pt-0 last:pb-0">
                <h3 className="font-semibold text-sm sm:text-base text-wind-text mb-2">{faq.q}</h3>
                <p className="text-xs sm:text-sm text-wind-muted leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Support Card */}
        <div className="mt-8 rounded-2xl border border-wind-border bg-wind-surface2 p-6 text-center">
          <Mail className="h-6 w-6 text-wind-accent mx-auto mb-2" />
          <h3 className="font-semibold text-sm">Still have questions?</h3>
          <p className="text-xs text-wind-muted mt-1 mb-3">Our support team is always ready to assist you.</p>
          <a
            href="mailto:support@windai.app"
            className="inline-flex items-center gap-2 rounded-xl bg-wind-accent px-4 py-2 text-xs font-semibold text-white hover:bg-wind-accentHover transition-colors"
          >
            Contact Support
          </a>
        </div>
      </main>

      <footer className="border-t border-wind-border py-8 text-center text-xs text-wind-muted">
        © {new Date().getFullYear()} Wind AI Technologies Inc. All rights reserved.
      </footer>
    </div>
  );
}
