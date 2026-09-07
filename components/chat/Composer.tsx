'use client';

import { useRef, useState, KeyboardEvent, DragEvent, ClipboardEvent } from 'react';
import { ArrowUp, Square, Paperclip, Sparkles, Mic, X, FileText, Image as ImageIcon } from 'lucide-react';
import clsx from 'clsx';
import { useToast } from '@/components/ui/Toast';
import type { MessageAttachment } from '@/types';

interface ComposerProps {
  onSend: (text: string, attachment?: MessageAttachment | null) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export default function Composer({ onSend, onStop, isStreaming, disabled }: ComposerProps) {
  const [value, setValue] = useState('');
  const [attachment, setAttachment] = useState<MessageAttachment | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const toast = useToast();

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 220) + 'px';
  }

  function handleSubmit() {
    const text = value.trim();
    if ((!text && !attachment) || isStreaming || disabled) return;
    onSend(text, attachment);
    setValue('');
    setAttachment(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function processFile(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      toast.push('File is too large. Maximum supported size is 10 MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAttachment({
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        data: result,
        size: file.size
      });
      toast.push(`Attached "${file.name}"`, 'success');
    };
    reader.onerror = () => {
      toast.push('Failed to read selected file.', 'error');
    };
    reader.readAsDataURL(file);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLTextAreaElement>) {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            processFile(file);
            return;
          }
        }
      }
    }
  }

  function toggleVoice() {
    if (typeof window === 'undefined') return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      toast.push('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.', 'info');
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        toast.push('Listening... Speak into your microphone.', 'info');
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        const recognized = finalTranscript || interimTranscript;
        if (recognized) {
          setValue((prev) => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${recognized.trim()}` : recognized.trim();
          });
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error !== 'no-speech') {
          toast.push(`Voice input error: ${event.error}`, 'error');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
      toast.push('Microphone access was denied or is unavailable.', 'error');
    }
  }

  const hasContent = value.trim().length > 0 || attachment !== null;

  return (
    <div className="border-t border-wind-border/70 bg-wind-bg/80 backdrop-blur-md px-4 py-4 sm:px-6">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        accept="image/*,.txt,.md,.json,.js,.ts,.py,.csv,.html,.css"
        className="hidden"
      />

      <div className="mx-auto max-w-3xl">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={clsx(
            'flex flex-col rounded-2xl border bg-wind-surface shadow-sm transition-all',
            isDragging
              ? 'border-indigo-500 ring-4 ring-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/20'
              : 'border-wind-border focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/10'
          )}
        >
          {/* Attachment Preview Chip */}
          {attachment && (
            <div className="flex items-center gap-2 px-3.5 pt-3 pb-1">
              <div className="group relative flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-50/70 dark:bg-indigo-950/40 pl-2 pr-3 py-1.5 text-xs text-wind-text shadow-sm animate-fadeIn">
                {attachment.mimeType.startsWith('image/') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={attachment.data}
                    alt={attachment.name}
                    className="h-7 w-7 rounded-lg object-cover border border-indigo-500/20 shadow-xs"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-600 dark:text-indigo-400">
                    <FileText className="h-4 w-4" />
                  </div>
                )}
                <div className="flex flex-col min-w-0 pr-1">
                  <span className="font-medium truncate max-w-[200px] text-wind-text">
                    {attachment.name}
                  </span>
                  {attachment.size && (
                    <span className="text-[10px] text-wind-muted">
                      {(attachment.size / 1024).toFixed(1)} KB
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setAttachment(null)}
                  className="ml-1 flex h-5 w-5 items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-wind-muted hover:text-wind-text transition-colors"
                  title="Remove attachment"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={
              isListening
                ? 'Listening... speak now'
                : 'Ask Wind anything, analyze code, draft documents, attach images...'
            }
            rows={1}
            disabled={disabled}
            className="w-full resize-none bg-transparent px-4 pt-3.5 pb-2 text-sm text-wind-text placeholder:text-wind-muted focus:outline-none max-h-[220px] disabled:opacity-60 leading-relaxed font-sans"
          />

          {/* Bottom Toolbar inside Composer */}
          <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={clsx(
                  'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                  attachment
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50'
                    : 'text-wind-muted hover:text-wind-text hover:bg-wind-surface2'
                )}
                title="Attach image or file (images, txt, md, json, py, ts)"
              >
                <Paperclip className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={toggleVoice}
                className={clsx(
                  'flex h-8 w-8 items-center justify-center rounded-lg transition-all',
                  isListening
                    ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/50 animate-pulse ring-2 ring-rose-500/40'
                    : 'text-wind-muted hover:text-wind-text hover:bg-wind-surface2'
                )}
                title={isListening ? 'Stop listening' : 'Voice input (speech-to-text)'}
              >
                <Mic className="h-4 w-4" />
              </button>

              <div className="hidden sm:flex items-center gap-1.5 ml-2 px-2 py-1 rounded-md bg-wind-surface2/60 text-[11px] font-medium text-wind-muted">
                <Sparkles className="h-3 w-3 text-indigo-500" />
                <span>Wind 3.0 Ready</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {value.trim().length > 0 && (
                <span className="text-[11px] text-wind-muted font-mono pr-1">
                  {value.trim().length} chars
                </span>
              )}

              {isStreaming ? (
                <button
                  onClick={onStop}
                  className="flex h-8 px-3 items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors"
                  aria-label="Stop generating"
                >
                  <Square className="h-3 w-3 fill-current" />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!hasContent || disabled}
                  className={clsx(
                    'flex h-8 w-8 items-center justify-center rounded-xl transition-all shadow-sm',
                    hasContent && !disabled
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105'
                      : 'bg-wind-surface2 text-wind-muted cursor-not-allowed opacity-60'
                  )}
                  aria-label="Send message"
                >
                  <ArrowUp className="h-4 w-4 stroke-[2.5]" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-wind-muted px-1.5 mt-2">
          <span>Wind AI can analyze images and documents. Verify critical details.</span>
          <span className="hidden sm:inline font-mono">↵ to send • Shift+↵ for new line • Drag & drop files</span>
        </div>
      </div>
    </div>
  );
}
