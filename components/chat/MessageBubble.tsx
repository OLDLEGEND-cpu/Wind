'use client';

import { useState } from 'react';
import {
  Copy,
  Check,
  RotateCcw,
  Pencil,
  AlertCircle,
  X,
  Volume2,
  VolumeX,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  FileText,
  Maximize2
} from 'lucide-react';
import clsx from 'clsx';
import Markdown from './Markdown';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import type { Message, MessageAttachment } from '@/types';

interface MessageBubbleProps {
  message: Message;
  isLast: boolean;
  onEdit: (id: string, newContent: string) => void;
  onRegenerate: () => void;
}

export default function MessageBubble({ message, isLast, onEdit, onRegenerate }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.content);
  const [speaking, setSpeaking] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const isUser = message.role === 'user';

  function handleCopy() {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function submitEdit() {
    if (editValue.trim() && editValue.trim() !== message.content) {
      onEdit(message.id, editValue.trim());
    }
    setEditing(false);
  }

  function toggleSpeech() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const cleanText = message.content
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/[#*_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }

  if (isUser) {
    return (
      <>
        <div className="flex justify-end gap-3 group animate-fadeIn">
          <div className="flex flex-col items-end max-w-[85%] sm:max-w-[75%]">
            {/* Attached Media / Document */}
            {message.attachment && (
              <div className="mb-2">
                {message.attachment.mimeType.startsWith('image/') ? (
                  <div className="relative group/img overflow-hidden rounded-2xl border border-wind-border shadow-sm max-w-[280px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={message.attachment.data}
                      alt={message.attachment.name}
                      className="w-full h-auto max-h-[220px] object-cover cursor-pointer hover:opacity-95 transition-opacity"
                      onClick={() => setPreviewImage(message.attachment?.data || null)}
                    />
                    <button
                      type="button"
                      onClick={() => setPreviewImage(message.attachment?.data || null)}
                      className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-white opacity-0 group-hover/img:opacity-100 transition-opacity backdrop-blur-xs"
                      title="Enlarge image"
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-xl border border-wind-border bg-wind-surface px-3 py-2 text-xs shadow-xs text-wind-text">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium truncate max-w-[220px]">
                        {message.attachment.name}
                      </span>
                      {message.attachment.size && (
                        <span className="text-[10px] text-wind-muted">
                          {(message.attachment.size / 1024).toFixed(1)} KB
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {editing ? (
              <div className="w-full min-w-[280px] rounded-2xl border border-wind-border bg-wind-surface p-3 shadow-md">
                <Textarea
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  rows={3}
                  className="bg-wind-surface2 text-sm border-0 focus:ring-0"
                />
                <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-wind-border">
                  <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={submitEdit}>
                    Save & Update
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {message.content && (
                  <div className="rounded-2xl rounded-tr-md bg-gradient-to-br from-indigo-600 to-indigo-700 px-4 py-3 text-sm text-white shadow-sm shadow-indigo-500/10 leading-relaxed break-words">
                    {message.content}
                  </div>
                )}
                <div className="flex items-center gap-1.5 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {message.edited && (
                    <span className="text-[11px] text-wind-muted font-medium mr-1">edited</span>
                  )}
                  <button
                    onClick={() => setEditing(true)}
                    className="p-1 rounded-md text-wind-muted hover:text-wind-text hover:bg-wind-surface2 transition-colors"
                    title="Edit prompt"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={handleCopy}
                    className="p-1 rounded-md text-wind-muted hover:text-wind-text hover:bg-wind-surface2 transition-colors"
                    title="Copy prompt"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Image Preview Modal */}
        {previewImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-fadeIn"
            onClick={() => setPreviewImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-wind-surface p-2 shadow-2xl">
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImage}
                alt="Enlarged preview"
                className="max-h-[85vh] w-auto rounded-xl object-contain"
              />
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex gap-3.5 group animate-fadeIn">
      {/* Assistant Avatar */}
      <div className="mt-1 shrink-0">
        <div
          className={clsx(
            'flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white shadow-sm shadow-indigo-500/20 transition-all',
            message.status === 'streaming' && 'ring-4 ring-indigo-500/20 animate-pulse'
          )}
        >
          <Sparkles className="h-4 w-4 fill-white/20" />
        </div>
      </div>

      {/* Content Container */}
      <div className="flex flex-col max-w-[90%] sm:max-w-[82%] min-w-0">
        {message.status === 'error' ? (
          <div className="flex flex-col gap-2.5 rounded-2xl rounded-tl-sm border border-red-200 dark:border-red-900/50 bg-red-50/70 dark:bg-red-950/20 p-4 text-sm text-red-700 dark:text-red-300 shadow-sm">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-500" />
              <span className="leading-relaxed">{message.error_message || 'The assistant encountered an unexpected error.'}</span>
            </div>
            {isLast && (
              <div className="flex justify-end pt-1">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={onRegenerate}
                  className="border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" /> Retry Generation
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl rounded-tl-sm border border-wind-border bg-wind-surface p-4 sm:p-5 text-sm text-wind-text min-w-0 shadow-sm shadow-black/[0.02]">
            {message.content ? (
              <Markdown content={message.content} />
            ) : message.status === 'streaming' ? (
              <TypingIndicator />
            ) : (
              <span className="text-wind-muted italic text-xs">No response available</span>
            )}

            {message.status === 'stopped' && (
              <div className="mt-3 pt-2 border-t border-wind-border flex items-center gap-1.5 text-xs text-wind-muted font-medium">
                <X className="h-3.5 w-3.5 text-rose-500" /> Generation paused by user
              </div>
            )}
          </div>
        )}

        {/* Action Toolbar */}
        {(message.status === 'complete' || message.status === 'stopped') && (
          <div className="flex items-center gap-1 mt-2 px-1 text-wind-muted">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 rounded-md p-1.5 text-xs hover:text-wind-text hover:bg-wind-surface2 transition-colors"
              title="Copy answer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>

            {isLast && (
              <button
                onClick={onRegenerate}
                className="inline-flex items-center gap-1 rounded-md p-1.5 text-xs hover:text-wind-text hover:bg-wind-surface2 transition-colors"
                title="Regenerate answer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            )}

            <button
              onClick={toggleSpeech}
              className={clsx(
                'inline-flex items-center gap-1 rounded-md p-1.5 text-xs transition-colors',
                speaking ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40' : 'hover:text-wind-text hover:bg-wind-surface2'
              )}
              title={speaking ? 'Stop speaking' : 'Read aloud'}
            >
              {speaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </button>

            <div className="h-3 w-px bg-wind-border mx-1" />

            <button
              onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
              className={clsx(
                'rounded-md p-1.5 text-xs transition-colors',
                feedback === 'up' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'hover:text-wind-text hover:bg-wind-surface2'
              )}
              title="Good response"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
              className={clsx(
                'rounded-md p-1.5 text-xs transition-colors',
                feedback === 'down' ? 'text-red-500 font-semibold' : 'hover:text-wind-text hover:bg-wind-surface2'
              )}
              title="Bad response"
            >
              <ThumbsDown className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 py-1.5 text-xs text-wind-muted font-medium">
      <div className="flex items-center gap-1">
        <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" style={{ animationDelay: '0ms' }} />
        <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" style={{ animationDelay: '180ms' }} />
        <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" style={{ animationDelay: '360ms' }} />
      </div>
      <span>Wind is thinking...</span>
    </div>
  );
}
