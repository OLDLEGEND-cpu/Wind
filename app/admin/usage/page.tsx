'use client';

import { useEffect, useState } from 'react';
import { PageHeader, StatCard, LoadingRows, Badge } from '@/components/admin/Primitives';

export default function AdminUsagePage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/usage', { cache: 'no-store' })
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <div>
        <PageHeader title="Usage & API monitoring" />
        <LoadingRows />
      </div>
    );
  }

  const totalRequests = data.byModel.reduce((s: number, m: any) => s + Number(m.requests), 0);
  const totalErrors = data.byModel.reduce((s: number, m: any) => s + Number(m.errors), 0);
  const totalTokens = data.byModel.reduce(
    (s: number, m: any) => s + Number(m.promptTokens) + Number(m.completionTokens),
    0
  );

  return (
    <div>
      <PageHeader title="Usage & API monitoring" subtitle="Gemini API activity across Wind AI" />

      <div className="px-6 sm:px-8 py-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total requests" value={totalRequests} />
        <StatCard label="Total tokens" value={totalTokens.toLocaleString()} />
        <StatCard label="Errors" value={totalErrors} />
      </div>

      <div className="px-6 sm:px-8 pb-6">
        <h3 className="text-sm font-semibold text-wind-text mb-3">By model</h3>
        <div className="rounded-2xl border border-wind-border bg-wind-surface overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-wind-border text-left text-xs text-wind-muted uppercase tracking-wide">
                <th className="px-5 py-3 font-medium">Model</th>
                <th className="px-5 py-3 font-medium">Requests</th>
                <th className="px-5 py-3 font-medium">Tokens</th>
                <th className="px-5 py-3 font-medium">Avg latency</th>
                <th className="px-5 py-3 font-medium">Errors</th>
              </tr>
            </thead>
            <tbody>
              {data.byModel.map((m: any) => (
                <tr key={m.model} className="border-b border-wind-border last:border-0">
                  <td className="px-5 py-3 font-medium text-wind-text">{m.model}</td>
                  <td className="px-5 py-3 text-wind-muted">{m.requests}</td>
                  <td className="px-5 py-3 text-wind-muted">
                    {(Number(m.promptTokens) + Number(m.completionTokens)).toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-wind-muted">{Math.round(m.avgLatency || 0)}ms</td>
                  <td className="px-5 py-3">
                    {Number(m.errors) > 0 ? <Badge tone="danger">{m.errors}</Badge> : <Badge>0</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="text-sm font-semibold text-wind-text mb-3">Top users (30 days)</h3>
        <div className="rounded-2xl border border-wind-border bg-wind-surface overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-wind-border text-left text-xs text-wind-muted uppercase tracking-wide">
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Requests</th>
                <th className="px-5 py-3 font-medium">Tokens</th>
              </tr>
            </thead>
            <tbody>
              {data.topUsers.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-6 text-center text-wind-muted">
                    No usage recorded yet.
                  </td>
                </tr>
              )}
              {data.topUsers.map((u: any) => (
                <tr key={u.id} className="border-b border-wind-border last:border-0">
                  <td className="px-5 py-3 text-wind-text">{u.name} <span className="text-wind-muted">({u.email})</span></td>
                  <td className="px-5 py-3 text-wind-muted">{u.requests}</td>
                  <td className="px-5 py-3 text-wind-muted">{Number(u.tokens).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="text-sm font-semibold text-wind-text mb-3">Recent errors</h3>
        <div className="rounded-2xl border border-wind-border bg-wind-surface divide-y divide-wind-border">
          {data.recentErrors.length === 0 && <p className="p-4 text-sm text-wind-muted">No recent errors. 🎉</p>}
          {data.recentErrors.map((e: any) => (
            <div key={e.id} className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-wind-text">{e.model}</span>
                <span className="text-xs text-wind-muted">{new Date(e.created_at).toLocaleString()}</span>
              </div>
              <p className="text-sm text-wind-danger mt-1">{e.error_message}</p>
              {e.userEmail && <p className="text-xs text-wind-muted mt-0.5">{e.userEmail}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
