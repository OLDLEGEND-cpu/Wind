'use client';

import { createContext, useContext, useCallback, useState, useEffect } from 'react';
import type { Conversation } from '@/types';

interface ConversationsContextValue {
  conversations: Conversation[];
  loading: boolean;
  search: string;
  setSearch: (v: string) => void;
  refresh: () => Promise<void>;
  createConversation: () => Promise<Conversation | null>;
  renameConversation: (id: string, title: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  pinConversation: (id: string, pinned: boolean) => Promise<void>;
}

const ConversationsContext = createContext<ConversationsContextValue | null>(null);

export function useConversations() {
  const ctx = useContext(ConversationsContext);
  if (!ctx) throw new Error('useConversations must be used within ConversationsProvider');
  return ctx;
}

export default function ConversationsProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const qs = search ? `?q=${encodeURIComponent(search)}` : '';
      const res = await fetch(`/api/conversations${qs}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations);
      }
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(refresh, search ? 250 : 0);
    return () => clearTimeout(timeout);
  }, [refresh, search]);

  const createConversation = useCallback(async () => {
    const res = await fetch('/api/conversations', { method: 'POST' });
    if (!res.ok) return null;
    const data = await res.json();
    setConversations((prev) => [data.conversation, ...prev]);
    return data.conversation as Conversation;
  }, []);

  const renameConversation = useCallback(async (id: string, title: string) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)));
    await fetch(`/api/conversations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    });
  }, []);

  const deleteConversation = useCallback(async (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
  }, []);

  const pinConversation = useCallback(async (id: string, pinned: boolean) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: pinned ? 1 : 0 } : c))
    );
    await fetch(`/api/conversations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pinned })
    });
    refresh();
  }, [refresh]);

  return (
    <ConversationsContext.Provider
      value={{
        conversations,
        loading,
        search,
        setSearch,
        refresh,
        createConversation,
        renameConversation,
        deleteConversation,
        pinConversation
      }}
    >
      {children}
    </ConversationsContext.Provider>
  );
}
