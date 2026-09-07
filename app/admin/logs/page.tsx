'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageHeader, Badge, LoadingRows, EmptyState } from '@/components/admin/Primitives';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[] | null>(null);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 30;

  const load = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (status) params.set('status', status);
    const res = await fetch(`/api/admin/logs?${params.toString()}`, { cache: 'no-store' });
    const data = await res.json();
    setLogs(data.logs || []);
    setTotal(data.total || 0);
  }, [status, page]);

  useEffect(() => {
    load();
  }, [load]);

  const toneFor = (s: string) => (s === 'success' ? 'success' : s === 'rate_limited' ? 'warning' : 'danger');

  return (
    <div>
      <PageHeader title="API Logs" subtitle="Raw Gemini request/response log" />

      <div className="px-6 sm:px-8 mb-4">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="h-10 rounded-lg border border-wind-border bg-wind-surface px-3 text-sm focus:outline-none"
        >
          <option value="">All statuses</option>
          <option value="success">Success</option>
          <option value="error">Error</option>
          <option value="rate_limited">Rate limited</option>
        </select>
      </div>

      <div className="px-6 sm:px-8 pb-8">
        <div className="rounded-2xl border border-wind-border bg-wind-surface overflow-hidden">
          {logs === null ? (
            <LoadingRows />
          ) : logs.length === 0 ? (
            <EmptyState message="No logs found." />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-wind-border text-left text-xs text-wind-muted uppercase tracking-wide">
                  <th className="px-5 py-3 font-medium">Time</th>
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Model</th>
                  <th className="px-5 py-3 font-medium">Tokens</th>
                  <th className="px-5 py-3 font-medium">Latency</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="border-b border-wind-border last:border-0">
                    <td className="px-5 py-3 text-wind-muted whitespace-nowrap">
                      {new Date(l.created_at).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-wind-text">{l.userEmail || '—'}</td>
                    <td className="px-5 py-3 text-wind-muted">{l.model}</td>
                    <td className="px-5 py-3 text-wind-muted">
                      {Number(l.prompt_tokens) + Number(l.completion_tokens)}
                    </td>
                    <td className="px-5 py-3 text-wind-muted">{l.latency_ms}ms</td>
                    <td className="px-5 py-3">
                      <Badge tone={toneFor(l.status) as any}>{l.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {total > pageSize && (
          <div className="flex items-center justify-between mt-4 text-sm text-wind-muted">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="disabled:opacity-40"
            >
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
