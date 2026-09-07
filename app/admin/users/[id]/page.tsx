'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { PageHeader, Badge, LoadingRows } from '@/components/admin/Primitives';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/components/layout/AuthProvider';

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const { user: currentUser } = useAuth();
  const [data, setData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/users/${params.id}`, { cache: 'no-store' });
    if (res.ok) setData(await res.json());
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateUser(patch: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch)
      });
      if (!res.ok) {
        const err = await res.json();
        toast.push(err.error || 'Update failed', 'error');
        return;
      }
      await load();
      toast.push('User updated', 'success');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this user and all their conversations? This cannot be undone.')) return;
    const res = await fetch(`/api/admin/users/${params.id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.push('User deleted', 'success');
      router.push('/admin/users');
    } else {
      const err = await res.json();
      toast.push(err.error || 'Delete failed', 'error');
    }
  }

  if (!data) {
    return (
      <div>
        <PageHeader title="User details" />
        <LoadingRows />
      </div>
    );
  }

  const { user, conversations, usage, recentAudit } = data;
  const isSelf = currentUser?.id === user.id;

  return (
    <div>
      <div className="px-6 sm:px-8 pt-8">
        <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-sm text-wind-muted hover:text-wind-text mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to users
        </Link>
      </div>

      <div className="px-6 sm:px-8 flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Avatar name={user.name} color={user.avatar_color} size="lg" />
          <div>
            <h1 className="text-xl font-semibold text-wind-text">{user.name}</h1>
            <p className="text-sm text-wind-muted">{user.email}</p>
            <div className="flex gap-2 mt-1.5">
              <Badge tone={user.role === 'admin' ? 'success' : 'neutral'}>{user.role}</Badge>
              <Badge tone={user.status === 'active' ? 'success' : 'danger'}>{user.status}</Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={saving || isSelf}
            onClick={() => updateUser({ role: user.role === 'admin' ? 'user' : 'admin' })}
          >
            {user.role === 'admin' ? 'Remove admin' : 'Make admin'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={saving || isSelf}
            onClick={() => updateUser({ status: user.status === 'active' ? 'suspended' : 'active' })}
          >
            {user.status === 'active' ? 'Suspend' : 'Reactivate'}
          </Button>
          <Button variant="danger" size="sm" disabled={isSelf} onClick={handleDelete}>
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </div>
      </div>

      <div className="px-6 sm:px-8 py-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-wind-border bg-wind-surface p-5">
          <p className="text-xs text-wind-muted uppercase tracking-wide">API requests</p>
          <p className="text-2xl font-semibold text-wind-text mt-1">{usage.totalRequests || 0}</p>
        </div>
        <div className="rounded-2xl border border-wind-border bg-wind-surface p-5">
          <p className="text-xs text-wind-muted uppercase tracking-wide">Tokens used</p>
          <p className="text-2xl font-semibold text-wind-text mt-1">{usage.totalTokens || 0}</p>
        </div>
        <div className="rounded-2xl border border-wind-border bg-wind-surface p-5">
          <p className="text-xs text-wind-muted uppercase tracking-wide">Errors</p>
          <p className="text-2xl font-semibold text-wind-text mt-1">{usage.errors || 0}</p>
        </div>
      </div>

      <div className="px-6 sm:px-8 pb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-wind-text mb-3">Recent conversations</h3>
          <div className="rounded-2xl border border-wind-border bg-wind-surface divide-y divide-wind-border">
            {conversations.length === 0 && <p className="p-4 text-sm text-wind-muted">No conversations yet.</p>}
            {conversations.map((c: any) => (
              <div key={c.id} className="p-4 flex items-center justify-between">
                <span className="text-sm text-wind-text truncate">{c.title}</span>
                <span className="text-xs text-wind-muted shrink-0 ml-2">{c.messageCount} msgs</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-wind-text mb-3">Recent activity</h3>
          <div className="rounded-2xl border border-wind-border bg-wind-surface divide-y divide-wind-border">
            {recentAudit.length === 0 && <p className="p-4 text-sm text-wind-muted">No activity recorded.</p>}
            {recentAudit.map((a: any) => (
              <div key={a.id} className="p-4">
                <p className="text-sm text-wind-text">{a.action}</p>
                <p className="text-xs text-wind-muted mt-0.5">
                  {new Date(a.created_at).toLocaleString()} {a.ip_address ? `· ${a.ip_address}` : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
