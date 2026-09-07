'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Plus,
  Search,
  MessageSquare,
  Pin,
  MoreHorizontal,
  Pencil,
  Trash2,
  Settings,
  LogOut,
  X
} from 'lucide-react';
import clsx from 'clsx';
import { useConversations } from './ConversationsProvider';
import { useAuth } from '@/components/layout/AuthProvider';
import Avatar from '@/components/ui/Avatar';
import Logo from '@/components/ui/Logo';
import ThemeToggle from '@/components/layout/ThemeToggle';
import { useToast } from '@/components/ui/Toast';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const { conversations, loading, search, setSearch, createConversation, renameConversation, deleteConversation, pinConversation } =
    useConversations();
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  async function handleNewChat() {
    const conv = await createConversation();
    if (conv) {
      router.push(`/chat/${conv.id}`);
      onCloseMobile();
    } else {
      toast.push('Could not start a new chat', 'error');
    }
  }

  function startRename(id: string, currentTitle: string) {
    setRenamingId(id);
    setRenameValue(currentTitle);
    setMenuOpenId(null);
  }

  async function submitRename(id: string) {
    if (renameValue.trim()) {
      await renameConversation(id, renameValue.trim());
    }
    setRenamingId(null);
  }

  async function handleDelete(id: string) {
    setMenuOpenId(null);
    await deleteConversation(id);
    if (pathname === `/chat/${id}`) {
      router.push('/chat');
    }
    toast.push('Conversation deleted', 'success');
  }

  const pinned = conversations.filter((c) => Number(c.pinned) === 1);
  const others = conversations.filter((c) => Number(c.pinned) !== 1);

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={onCloseMobile}
        />
      )}
      <aside
        className={clsx(
          'fixed md:static inset-y-0 left-0 z-40 flex w-72 shrink-0 flex-col border-r border-wind-border bg-wind-surface transition-transform duration-200 md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <Link href="/chat">
            <Logo size={24} />
          </Link>
          <button onClick={onCloseMobile} className="md:hidden text-wind-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-3">
          <button
            onClick={handleNewChat}
            className="flex w-full items-center gap-2 rounded-xl border border-wind-border bg-wind-surface px-3.5 py-2.5 text-sm font-medium text-wind-text hover:bg-wind-surface2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New chat
          </button>
        </div>

        <div className="px-3 mt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-wind-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chats"
              className="w-full rounded-lg bg-wind-surface2 pl-8 pr-3 py-2 text-sm text-wind-text placeholder:text-wind-muted focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 mt-3 pb-3">
          {loading && conversations.length === 0 && (
            <div className="space-y-2 mt-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-9 rounded-lg bg-wind-surface2 animate-pulse" />
              ))}
            </div>
          )}

          {!loading && conversations.length === 0 && (
            <div className="mt-6 text-center px-2">
              <MessageSquare className="h-6 w-6 text-wind-muted mx-auto mb-2" />
              <p className="text-xs text-wind-muted">
                {search ? 'No chats match your search.' : 'No conversations yet. Start one above.'}
              </p>
            </div>
          )}

          {pinned.length > 0 && (
            <div className="mb-2">
              <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-wind-muted">
                Pinned
              </p>
              {pinned.map((c) => (
                <ConversationRow
                  key={c.id}
                  conv={c}
                  active={pathname === `/chat/${c.id}`}
                  menuOpen={menuOpenId === c.id}
                  renaming={renamingId === c.id}
                  renameValue={renameValue}
                  onOpenMenu={() => setMenuOpenId(menuOpenId === c.id ? null : c.id)}
                  onCloseMenu={() => setMenuOpenId(null)}
                  onRenameChange={setRenameValue}
                  onStartRename={() => startRename(c.id, c.title)}
                  onSubmitRename={() => submitRename(c.id)}
                  onDelete={() => handleDelete(c.id)}
                  onPin={() => pinConversation(c.id, Number(c.pinned) !== 1)}
                  onNavigate={onCloseMobile}
                />
              ))}
            </div>
          )}

          {others.length > 0 && (
            <div>
              {pinned.length > 0 && (
                <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-wind-muted">
                  Recent
                </p>
              )}
              {others.map((c) => (
                <ConversationRow
                  key={c.id}
                  conv={c}
                  active={pathname === `/chat/${c.id}`}
                  menuOpen={menuOpenId === c.id}
                  renaming={renamingId === c.id}
                  renameValue={renameValue}
                  onOpenMenu={() => setMenuOpenId(menuOpenId === c.id ? null : c.id)}
                  onCloseMenu={() => setMenuOpenId(null)}
                  onRenameChange={setRenameValue}
                  onStartRename={() => startRename(c.id, c.title)}
                  onSubmitRename={() => submitRename(c.id)}
                  onDelete={() => handleDelete(c.id)}
                  onPin={() => pinConversation(c.id, Number(c.pinned) !== 1)}
                  onNavigate={onCloseMobile}
                />
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-wind-border p-3 space-y-0.5">
          {user?.role === 'admin' && (
            <Link
              href="/admin"
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors"
            >
              <Settings className="h-3.5 w-3.5" />
              Admin dashboard
            </Link>
          )}
          <Link
            href="/profile"
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-wind-muted hover:bg-wind-surface2 hover:text-wind-text transition-colors"
          >
            <Avatar name={user?.name || '?'} color={user?.avatarColor} size="sm" />
            My Profile
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-wind-muted hover:bg-wind-surface2 hover:text-wind-text transition-colors"
          >
            <Settings className="h-3.5 w-3.5" />
            Settings
          </Link>
          <Link
            href="/help"
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-wind-muted hover:bg-wind-surface2 hover:text-wind-text transition-colors"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Help & FAQ
          </Link>
          <div className="flex items-center justify-between pt-2 px-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <Avatar name={user?.name || '?'} color={user?.avatarColor} size="sm" />
              <span className="text-sm text-wind-text truncate">{user?.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <button
                onClick={logout}
                aria-label="Log out"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-wind-muted hover:bg-wind-surface2 hover:text-wind-danger transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

interface RowProps {
  conv: { id: string; title: string; pinned: number | boolean };
  active: boolean;
  menuOpen: boolean;
  renaming: boolean;
  renameValue: string;
  onOpenMenu: () => void;
  onCloseMenu: () => void;
  onRenameChange: (v: string) => void;
  onStartRename: () => void;
  onSubmitRename: () => void;
  onDelete: () => void;
  onPin: () => void;
  onNavigate: () => void;
}

function ConversationRow({
  conv,
  active,
  menuOpen,
  renaming,
  renameValue,
  onOpenMenu,
  onCloseMenu,
  onRenameChange,
  onStartRename,
  onSubmitRename,
  onDelete,
  onPin,
  onNavigate
}: RowProps) {
  return (
    <div className="relative group">
      {renaming ? (
        <input
          autoFocus
          value={renameValue}
          onChange={(e) => onRenameChange(e.target.value)}
          onBlur={onSubmitRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSubmitRename();
            if (e.key === 'Escape') onCloseMenu();
          }}
          className="w-full rounded-lg bg-wind-surface2 px-3 py-2 text-sm text-wind-text focus:outline-none"
        />
      ) : (
        <Link
          href={`/chat/${conv.id}`}
          onClick={onNavigate}
          className={clsx(
            'flex items-center gap-2 rounded-lg px-3 py-2 text-sm truncate transition-colors',
            active ? 'bg-wind-accentSoft text-wind-accent font-medium' : 'text-wind-text hover:bg-wind-surface2'
          )}
        >
          {Number(conv.pinned) === 1 && <Pin className="h-3 w-3 shrink-0" />}
          <span className="truncate flex-1">{conv.title}</span>
          <button
            onClick={(e) => {
              e.preventDefault();
              onOpenMenu();
            }}
            className="opacity-0 group-hover:opacity-100 shrink-0 text-wind-muted hover:text-wind-text"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </Link>
      )}

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={onCloseMenu} />
          <div className="absolute right-0 top-9 z-20 w-40 rounded-xl border border-wind-border bg-wind-surface shadow-lg py-1">
            <button
              onClick={onPin}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-wind-text hover:bg-wind-surface2"
            >
              <Pin className="h-3.5 w-3.5" />
              {Number(conv.pinned) === 1 ? 'Unpin' : 'Pin'}
            </button>
            <button
              onClick={onStartRename}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-wind-text hover:bg-wind-surface2"
            >
              <Pencil className="h-3.5 w-3.5" />
              Rename
            </button>
            <button
              onClick={onDelete}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-wind-danger hover:bg-wind-surface2"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}
