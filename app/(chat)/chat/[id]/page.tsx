'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ConversationView from '@/components/chat/ConversationView';
import type { Message, Conversation, MessageAttachment } from '@/types';

export default function ConversationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<{
    text: string;
    attachment?: MessageAttachment | null;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setMessages(null);
      setNotFound(false);

      const pending = sessionStorage.getItem(`wind-pending-${params.id}`);
      if (pending) {
        sessionStorage.removeItem(`wind-pending-${params.id}`);
      }

      const res = await fetch(`/api/conversations/${params.id}`, { cache: 'no-store' });
      if (cancelled) return;

      if (res.status === 404 || res.status === 403) {
        setNotFound(true);
        return;
      }
      if (!res.ok) {
        setNotFound(true);
        return;
      }
      const data = await res.json();
      setConversation(data.conversation);
      setMessages(data.messages);

      if (pending) {
        try {
          const parsed = JSON.parse(pending);
          setPendingPayload(parsed);
        } catch {
          setPendingPayload({ text: pending });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (notFound) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-wind-text font-medium">This conversation doesn&apos;t exist or was deleted.</p>
        <button
          onClick={() => router.push('/chat')}
          className="text-sm text-wind-accent hover:underline"
        >
          Start a new chat
        </button>
      </div>
    );
  }

  if (messages === null) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-wind-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <AutoSendWrapper
      conversationId={params.id}
      conversation={conversation}
      initialMessages={messages}
      pendingPayload={pendingPayload}
    />
  );
}

function AutoSendWrapper({
  conversationId,
  conversation,
  initialMessages,
  pendingPayload
}: {
  conversationId: string;
  conversation?: Conversation | null;
  initialMessages: Message[];
  pendingPayload: { text: string; attachment?: MessageAttachment | null } | null;
}) {
  const [sent, setSent] = useState(false);

  return (
    <ConversationView
      key={conversationId}
      conversationId={conversationId}
      conversation={conversation}
      initialMessages={initialMessages}
      pendingPayload={!sent ? pendingPayload : null}
      onAutoSent={() => setSent(true)}
    />
  );
}
