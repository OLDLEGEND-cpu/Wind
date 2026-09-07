'use client';

import { Sparkles, Code2, Compass, PenTool } from 'lucide-react';

const PROMPT_CARDS = [
  {
    icon: Code2,
    badge: 'Coding',
    title: 'TypeScript Design Pattern',
    prompt: 'Show me an idiomatic TypeScript example of the Repository pattern with error handling.'
  },
  {
    icon: Sparkles,
    badge: 'Explanation',
    title: 'Quantum Computing',
    prompt: 'Explain quantum entanglement and quantum supremacy like I am a curious high schooler.'
  },
  {
    icon: PenTool,
    badge: 'Writing',
    title: 'Executive Announcement',
    prompt: 'Draft an executive launch announcement email for a new AI-powered developer tool.'
  },
  {
    icon: Compass,
    badge: 'Strategy',
    title: 'Architecture Review',
    prompt: 'Give me a 5-point security and scalability checklist for deploying a multi-tenant web app.'
  }
];

export default function SuggestedPrompts({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl px-2">
      {PROMPT_CARDS.map((card) => (
        <button
          key={card.title}
          onClick={() => onPick(card.prompt)}
          className="group flex flex-col justify-between rounded-2xl border border-wind-border bg-wind-surface p-4 text-left shadow-sm hover:border-indigo-500/40 hover:bg-wind-surface2/70 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              <card.icon className="h-4 w-4" />
            </div>
            <span className="rounded-full bg-wind-surface2 px-2 py-0.5 text-[10px] font-semibold text-wind-muted uppercase tracking-wider">
              {card.badge}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-sm text-wind-text group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {card.title}
            </h3>
            <p className="mt-1 text-xs text-wind-muted line-clamp-2 leading-relaxed">
              {card.prompt}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
