'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { PageHeader, Badge, LoadingRows, EmptyState } from '@/components/admin/Primitives';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[] | null>(null);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (role) params.set('role', role);
    if (status) params.set('status', status);
    const res = await fetch(`/api/admin/users?${params.toString()}`, { cache: 'no-store' });
    const data = await res.json();
    setUsers(data.users || []);
  }, [search, role, status]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div>
      <PageHeader title="Users" subtitle="Manage accounts, roles, and access" />
      <div className="px-6 sm:px-8 flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-wind-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email"
            className="w-full h-10 rounded-lg border border-wind-border bg-wind-surface pl-9 pr-3 text-sm focus:outline-none focus:border-wind-accent"
          />
        </div>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="h-10 rounded-lg border border-wind-border bg-wind-surface px-3 text-sm focus:outline-none"
        >
          <option value="">All roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-10 rounded-lg border border-wind-border bg-wind-surface px-3 text-sm focus:outline-none"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div className="px-6 sm:px-8 pb-8">
        <div className="rounded-2xl border border-wind-border bg-wind-surface overflow-hidden">
          {users === null ? (
            <LoadingRows />
          ) : users.length === 0 ? (
            <EmptyState message="No users match your filters." />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-wind-border text-left text-xs text-wind-muted uppercase tracking-wide">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Chats</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-wind-border last:border-0 hover:bg-wind-surface2/60 transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/admin/users/${u.id}`} className="font-medium text-wind-text hover:text-wind-accent">
                        {u.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-wind-muted">{u.email}</td>
                    <td className="px-5 py-3">
                      <Badge tone={u.role === 'admin' ? 'success' : 'neutral'}>{u.role}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={u.status === 'active' ? 'success' : 'danger'}>{u.status}</Badge>
                    </td>
                    <td className="px-5 py-3 text-wind-muted">{u.conversationCount}</td>
                    <td className="px-5 py-3 text-wind-muted">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
