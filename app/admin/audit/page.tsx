'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { PageHeader, LoadingRows, EmptyState } from '@/components/admin/Primitives';

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[] | null>(null);
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 30;

  const load = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (action) params.set('action', action);
    const res = await fetch(`/api/admin/audit?${params.toString()}`, { cache: 'no-store' });
    const data = await res.json();
    setLogs(data.logs || []);
    setTotal(data.total || 0);
  }, [action, page]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div>
      <PageHeader title="Audit activity" subtitle="Every sensitive action taken across Wind AI" />

      <div className="px-6 sm:px-8 mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-wind-muted" />
          <input
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(1);
            }}
            placeholder="Filter by action (e.g. login, delete)"
            className="w-full h-10 rounded-lg border border-wind-border bg-wind-surface pl-9 pr-3 text-sm focus:outline-none focus:border-wind-accent"
          />
        </div>
      </div>

      <div className="px-6 sm:px-8 pb-8">
        <div className="rounded-2xl border border-wind-border bg-wind-surface overflow-hidden">
          {logs === null ? (
            <LoadingRows />
          ) : logs.length === 0 ? (
            <EmptyState message="No audit entries found." />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-wind-border text-left text-xs text-wind-muted uppercase tracking-wide">
                  <th className="px-5 py-3 font-medium">Time</th>
                  <th className="px-5 py-3 font-medium">Actor</th>
                  <th className="px-5 py-3 font-medium">Action</th>
                  <th className="px-5 py-3 font-medium">Target</th>
                  <th className="px-5 py-3 font-medium">IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="border-b border-wind-border last:border-0">
                    <td className="px-5 py-3 text-wind-muted whitespace-nowrap">
                      {new Date(l.created_at).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-wind-text">{l.actor_email || 'system'}</td>
                    <td className="px-5 py-3 text-wind-text font-medium">{l.action}</td>
                    <td className="px-5 py-3 text-wind-muted">
                      {l.target_type ? `${l.target_type}:${String(l.target_id).slice(0, 8)}` : '—'}
                    </td>
                    <td className="px-5 py-3 text-wind-muted">{l.ip_address || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {total > pageSize && (
          <div className="flex items-center justify-between mt-4 text-sm text-wind-muted">
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="disabled:opacity-40">
              Previous
            </button>
            <span>
              Page {page} of {Math.ceil(total / pageSize)}
            </span>
            <button
              disabled={page * pageSize >= total}
              onClick={() => setPage((p) => p + 1)}
              className="disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
