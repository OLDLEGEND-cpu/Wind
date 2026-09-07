'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Download,
  Share2,
  Check,
  Zap,
  Brain,
  ChevronDown,
  Copy,
  FileDown,
  FileText,
  Sparkles
} from 'lucide-react';
import MessageBubble from './MessageBubble';
import Composer from './Composer';
import SuggestedPrompts from './SuggestedPrompts';
import { useChatStream } from './useChatStream';
import { useConversations } from './ConversationsProvider';
import { useToast } from '@/components/ui/Toast';
import type { Message, Conversation, MessageAttachment } from '@/types';

interface ConversationViewProps {
  conversationId: string;
  conversation?: Conversation | null;
  initialMessages: Message[];
  pendingPayload?: { text: string; attachment?: MessageAttachment | null } | null;
  onAutoSent?: () => void;
}

const MODELS = [
  {
    id: 'gemini-3.6-flash',
    name: 'Wind Fast',
    engine: 'Gemini 3.6',
    icon: Zap,
    color: 'text-amber-500',
    desc: 'Rapid token streaming for daily chat, summaries & search'
  },
  {
    id: 'gemini-3.7-flash',
    name: 'Wind Pro',
    engine: 'Gemini 3.7',
    icon: Brain,
    color: 'text-indigo-500',
    desc: 'Deep reasoning, advanced coding & document synthesis'
  }
];

export default function ConversationView({
  conversationId,
  conversation,
  initialMessages,
  pendingPayload,
  onAutoSent
}: ConversationViewProps) {
  const { messages, isStreaming, error, send, regenerate, stop, editMessage, onTitle } = useChatStream(
    conversationId,
    initialMessages
  );
  const { refresh } = useConversations();
  const toast = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [currentModel, setCurrentModel] = useState<string>(
    conversation?.model || 'gemini-3.6-flash'
  );
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [copiedTranscript, setCopiedTranscript] = useState(false);

  useEffect(() => {
    onTitle(() => refresh());
  }, [onTitle, refresh]);

  useEffect(() => {
    if (pendingPayload) {
      send(pendingPayload.text, pendingPayload.attachment, currentModel);
      onAutoSent?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingPayload]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  async function handleSwitchModel(modelId: string) {
    setCurrentModel(modelId);
    setModelDropdownOpen(false);
    try {
      await fetch(`/api/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: modelId })
      });
      const selected = MODELS.find((m) => m.id === modelId);
      toast.push(`Switched to ${selected?.name || modelId}`, 'info');
    } catch {
      // Non-fatal
    }
  }

  function formatTranscriptText(): string {
    const title = conversation?.title || 'Wind AI Chat';
    const lines: string[] = [`# ${title}\n`];
    messages.forEach((m) => {
      const sender = m.role === 'user' ? 'User' : 'Wind AI';
      lines.push(`### ${sender} (${new Date(m.created_at).toLocaleTimeString()}):`);
      if (m.attachment) {
        lines.push(`*[Attached: ${m.attachment.name}]*`);
      }
      lines.push(m.content);
      lines.push('');
    });
    return lines.join('\n');
  }

  function handleExportMarkdown() {
    setExportDropdownOpen(false);
    const content = formatTranscriptText();
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(conversation?.title || 'wind-chat').toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.push('Conversation exported as Markdown (.md)', 'success');
  }

  function handleExportText() {
    setExportDropdownOpen(false);
    const content = formatTranscriptText();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(conversation?.title || 'wind-chat').toLowerCase().replace(/[^a-z0-9]/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.push('Conversation exported as Text (.txt)', 'success');
  }

  function handleCopyTranscript() {
    setExportDropdownOpen(false);
    const content = formatTranscriptText();
    navigator.clipboard.writeText(content);
    setCopiedTranscript(true);
    toast.push('Transcript copied to clipboard', 'success');
    setTimeout(() => setCopiedTranscript(false), 2000);
  }

  const activeModelMeta = MODELS.find((m) => m.id === currentModel) || MODELS[0];
  const ActiveModelIcon = activeModelMeta.icon;
  const lastAssistantIndex = [...messages].map((m) => m.role).lastIndexOf('assistant');

  return (
    <div className="flex h-full flex-col bg-wind-bg">
      {/* Interactive Chat Subheader Bar */}
      <div className="flex items-center justify-between border-b border-wind-border/60 bg-wind-surface/50 px-4 py-2 text-xs backdrop-blur-xs z-10">
        {/* Model Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setModelDropdownOpen(!modelDropdownOpen);
              setExportDropdownOpen(false);
            }}
            className="flex items-center gap-1.5 rounded-xl border border-wind-border bg-wind-surface px-2.5 py-1.5 font-medium text-wind-text shadow-2xs hover:bg-wind-surface2 transition-colors"
          >
            <ActiveModelIcon className={`h-3.5 w-3.5 ${activeModelMeta.color}`} />
            <span>{activeModelMeta.name}</span>
            <span className="text-[10px] text-wind-muted font-normal">({activeModelMeta.engine})</span>
            <ChevronDown className="h-3 w-3 text-wind-muted ml-0.5" />
          </button>

          {modelDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setModelDropdownOpen(false)}
              />
              <div className="absolute left-0 top-full mt-1.5 w-72 rounded-2xl border border-wind-border bg-wind-surface p-1.5 shadow-xl z-30 animate-fadeIn">
                <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-wind-muted">
                  Select Engine
                </div>
                {MODELS.map((model) => {
                  const Icon = model.icon;
                  const isSelected = model.id === currentModel;
                  return (
                    <button
                      key={model.id}
                      onClick={() => handleSwitchModel(model.id)}
                      className={`flex w-full items-start gap-2.5 rounded-xl p-2.5 text-left transition-colors ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                          : 'hover:bg-wind-surface2 text-wind-text'
                      }`}
                    >
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-wind-surface2">
                        <Icon className={`h-4 w-4 ${model.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-wind-text">{model.name}</span>
                          <span className="text-[10px] font-mono text-wind-muted">{model.engine}</span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-wind-muted leading-tight">
                          {model.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Right Tools: Message Count & Export Menu */}
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <span className="hidden sm:inline-block rounded-full bg-wind-surface2 px-2.5 py-1 text-[10px] font-semibold text-wind-muted">
              {messages.length} {messages.length === 1 ? 'message' : 'messages'}
            </span>
          )}

          {/* Export Dropdown */}
          {messages.length > 0 && (
            <div className="relative">
              <button
                onClick={() => {
                  setExportDropdownOpen(!exportDropdownOpen);
                  setModelDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 rounded-xl border border-wind-border bg-wind-surface px-2.5 py-1.5 text-xs font-medium text-wind-text shadow-2xs hover:bg-wind-surface2 transition-colors"
                title="Export or share transcript"
              >
                <Download className="h-3.5 w-3.5 text-wind-muted" />
                <span className="hidden sm:inline">Export</span>
                <ChevronDown className="h-3 w-3 text-wind-muted" />
              </button>

              {exportDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setExportDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1.5 w-52 rounded-2xl border border-wind-border bg-wind-surface p-1.5 shadow-xl z-30 animate-fadeIn">
                    <div className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-wind-muted">
                      Export Transcript
                    </div>
                    <button
                      onClick={handleExportMarkdown}
                      className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-medium text-wind-text hover:bg-wind-surface2 transition-colors"
                    >
                      <FileDown className="h-4 w-4 text-indigo-500" />
                      <span>Download Markdown (.md)</span>
                    </button>
                    <button
                      onClick={handleExportText}
                      className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-medium text-wind-text hover:bg-wind-surface2 transition-colors"
                    >
                      <FileText className="h-4 w-4 text-emerald-500" />
                      <span>Download Plain Text (.txt)</span>
                    </button>
                    <div className="my-1 border-t border-wind-border/50" />
                    <button
                      onClick={handleCopyTranscript}
                      className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-medium text-wind-text hover:bg-wind-surface2 transition-colors"
                    >
                      {copiedTranscript ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-wind-muted" />
                      )}
                      <span>Copy Full Transcript</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-8">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-6 py-12">
              <div className="text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 mb-3 shadow-inner">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-wind-text mb-1">
                  What can Wind help you with?
                </h2>
                <p className="text-xs text-wind-muted max-w-md">
                  Ask complex questions, analyze images and code, draft executive emails, or try a prompt below.
                </p>
              </div>
              <SuggestedPrompts
                onPick={(text) => send(text, null, currentModel)}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {messages.map((m, idx) => (
                <MessageBubble
                  key={m.id}
                  message={m}
                  isLast={m.role === 'assistant' && idx === lastAssistantIndex && !isStreaming}
                  onEdit={editMessage}
                  onRegenerate={() => regenerate(currentModel)}
                />
              ))}
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </div>

      {error && (
        <div className="mx-auto max-w-3xl w-full px-4">
          <div className="flex items-center gap-2 rounded-xl bg-wind-danger/10 text-wind-danger text-sm px-3 py-2 mb-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        </div>
      )}

      <Composer
        onSend={(text, attachment) => send(text, attachment, currentModel)}
        onStop={stop}
        isStreaming={isStreaming}
      />
    </div>
  );
}
