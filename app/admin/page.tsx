'use client';

import { useEffect, useState } from 'react';
import { PageHeader, StatCard, LoadingRows } from '@/components/admin/Primitives';

export default function AdminOverviewPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/overview', { cache: 'no-store' })
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <div>
        <PageHeader title="Overview" subtitle="Wind AI at a glance" />
        <LoadingRows />
      </div>
    );
  }

  const maxCount = Math.max(1, ...data.dailyActivity.map((d: any) => Number(d.count)));

  return (
    <div>
      <PageHeader title="Overview" subtitle="Wind AI at a glance" />
      <div className="px-6 sm:px-8 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total users" value={data.users.total} sub={`+${data.users.newThisWeek} this week`} />
        <StatCard label="Conversations" value={data.conversations.total} sub={`+${data.conversations.newThisWeek} this week`} />
        <StatCard label="Messages today" value={data.messages.today} sub={`${data.messages.total} total`} />
        <StatCard
          label="Avg latency"
          value={data.usage.avgLatency ? `${Math.round(data.usage.avgLatency)}ms` : '—'}
          sub={`${data.usage.errors || 0} errors (7d)`}
        />
      </div>

      <div className="px-6 sm:px-8 pb-8">
        <div className="rounded-2xl border border-wind-border bg-wind-surface p-6">
          <h3 className="text-sm font-semibold text-wind-text mb-5">Message activity — last 14 days</h3>
          <div className="flex items-end gap-2 h-40">
            {data.dailyActivity.map((d: any) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5 group">
                <div className="relative w-full flex items-end justify-center h-32">
                  <div
                    className="w-full max-w-[28px] rounded-t-md bg-wind-accent/80 group-hover:bg-wind-accent transition-colors"
                    style={{ height: `${(Number(d.count) / maxCount) * 100}%`, minHeight: 2 }}
                  />
                </div>
                <span className="text-[10px] text-wind-muted">
                  {new Date(d.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
