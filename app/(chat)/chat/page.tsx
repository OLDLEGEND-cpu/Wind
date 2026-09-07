'use client';

import { useRouter } from 'next/navigation';
import SuggestedPrompts from '@/components/chat/SuggestedPrompts';
import { useConversations } from '@/components/chat/ConversationsProvider';
import Composer from '@/components/chat/Composer';
import { useState } from 'react';
import type { MessageAttachment } from '@/types';

export default function NewChatPage() {
  const { createConversation } = useConversations();
  const router = useRouter();
  const [starting, setStarting] = useState(false);

  async function handleStart(text: string, attachment?: MessageAttachment | null) {
    if (starting) return;
    setStarting(true);
    const conv = await createConversation();
    if (conv) {
      sessionStorage.setItem(
        `wind-pending-${conv.id}`,
        JSON.stringify({ text, attachment: attachment || null })
      );
      router.push(`/chat/${conv.id}`);
    } else {
      setStarting(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
        <div>
          <h2 className="text-xl font-semibold text-wind-text text-center mb-1">
            What can I help with?
          </h2>
          <p className="text-sm text-wind-muted text-center">Ask anything, or try one of these</p>
        </div>
        <SuggestedPrompts onPick={handleStart} />
      </div>
      <Composer onSend={handleStart} onStop={() => {}} isStreaming={starting} disabled={starting} />
    </div>
  );
}
