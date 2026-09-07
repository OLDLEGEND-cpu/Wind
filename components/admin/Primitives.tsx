export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="px-6 sm:px-8 pt-8 pb-2">
      <h1 className="text-2xl font-semibold text-wind-text">{title}</h1>
      {subtitle && <p className="text-sm text-wind-muted mt-1">{subtitle}</p>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-wind-border bg-wind-surface p-5">
      <p className="text-xs font-medium text-wind-muted uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-semibold text-wind-text mt-2">{value}</p>
      {sub && <p className="text-xs text-wind-muted mt-1">{sub}</p>}
    </div>
  );
}

export function Badge({
  children,
  tone = 'neutral'
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'success' | 'danger' | 'warning';
}) {
  const tones: Record<string, string> = {
    neutral: 'bg-wind-surface2 text-wind-muted',
    success: 'bg-emerald-500/10 text-emerald-600',
    danger: 'bg-wind-danger/10 text-wind-danger',
    warning: 'bg-amber-500/10 text-amber-600'
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-16 text-sm text-wind-muted">{message}</div>
  );
}

export function LoadingRows() {
  return (
    <div className="space-y-2 p-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-10 rounded-lg bg-wind-surface2 animate-pulse" />
      ))}
    </div>
  );
}
