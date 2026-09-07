'use client';

import { useCallback, useRef, useState } from 'react';
import type { Message, MessageAttachment } from '@/types';

export function useChatStream(conversationId: string, initialMessages: Message[]) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const currentAssistantIdRef = useRef<string | null>(null);
  const partialTextRef = useRef('');
  const onTitleRef = useRef<((title: string) => void) | null>(null);

  const runStream = useCallback(
    async (
      mode: 'send' | 'regenerate',
      content?: string,
      attachment?: MessageAttachment | null,
      modelOverride?: string
    ) => {
      setError(null);
      setIsStreaming(true);
      partialTextRef.current = '';

      const controller = new AbortController();
      abortRef.current = controller;

      if (mode === 'send') {
        const userMsg: Message = {
          id: `temp-user-${Date.now()}`,
          role: 'user',
          content: content?.trim() || (attachment ? `Attached: ${attachment.name}` : ''),
          status: 'complete',
          attachment: attachment || null,
          created_at: new Date().toISOString()
        };
        setMessages((prev) => [...prev, userMsg]);
      }

      const placeholderId = `temp-assistant-${Date.now()}`;
      currentAssistantIdRef.current = placeholderId;
      setMessages((prev) => [
        ...prev,
        {
          id: placeholderId,
          role: 'assistant',
          content: '',
          status: 'streaming',
          created_at: new Date().toISOString()
        }
      ]);

      try {
        const res = await fetch('/api/gemini/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId,
            mode,
            content,
            attachment,
            model: modelOverride
          }),
          signal: controller.signal
        });

        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to reach Wind. Please try again.');
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let realAssistantId = placeholderId;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const events = buffer.split('\n\n');
          buffer = events.pop() || '';

          for (const evt of events) {
            const lines = evt.split('\n');
            const eventLine = lines.find((l) => l.startsWith('event:'));
            const dataLine = lines.find((l) => l.startsWith('data:'));
            if (!eventLine || !dataLine) continue;
            const eventName = eventLine.replace('event:', '').trim();
            const data = JSON.parse(dataLine.replace('data:', '').trim());

            if (eventName === 'start') {
              realAssistantId = data.messageId;
              currentAssistantIdRef.current = realAssistantId;
              setMessages((prev) =>
                prev.map((m) => (m.id === placeholderId ? { ...m, id: realAssistantId } : m))
              );
            } else if (eventName === 'chunk') {
              partialTextRef.current += data.text;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === realAssistantId ? { ...m, content: partialTextRef.current } : m
                )
              );
            } else if (eventName === 'title') {
              onTitleRef.current?.(data.title);
            } else if (eventName === 'error') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === realAssistantId
                    ? { ...m, status: 'error', error_message: data.message }
                    : m
                )
              );
              setError(data.message);
            } else if (eventName === 'done') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === realAssistantId && m.status === 'streaming'
                    ? { ...m, status: 'complete' }
                    : m
                )
              );
            }
          }
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          // Handled by stop()
        } else {
          setError(err.message || 'Something went wrong.');
          setMessages((prev) =>
            prev.map((m) =>
              m.id === currentAssistantIdRef.current
                ? { ...m, status: 'error', error_message: err.message }
                : m
            )
          );
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [conversationId]
  );

  const send = useCallback(
    (content: string, attachment?: MessageAttachment | null, model?: string) =>
      runStream('send', content, attachment, model),
    [runStream]
  );
  const regenerate = useCallback(
    (model?: string) => runStream('regenerate', undefined, undefined, model),
    [runStream]
  );

  const stop = useCallback(async () => {
    abortRef.current?.abort();
    const messageId = currentAssistantIdRef.current;
    if (messageId) {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, status: 'stopped' } : m))
      );
      await fetch(`/api/conversations/${conversationId}/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, partialContent: partialTextRef.current })
      }).catch(() => {});
    }
    setIsStreaming(false);
  }, [conversationId]);

  const editMessage = useCallback(
    async (messageId: string, newContent: string) => {
      await fetch(`/api/conversations/${conversationId}/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent })
      });
      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.id === messageId);
        if (idx === -1) return prev;
        const truncated = prev.slice(0, idx + 1).map((m) =>
          m.id === messageId ? { ...m, content: newContent, edited: true } : m
        );
        return truncated;
      });
      await runStream('regenerate');
    },
    [conversationId, runStream]
  );

  const onTitle = useCallback((cb: (title: string) => void) => {
    onTitleRef.current = cb;
  }, []);

  return { messages, setMessages, isStreaming, error, send, regenerate, stop, editMessage, onTitle };
}
