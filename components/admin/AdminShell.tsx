'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
  LayoutDashboard,
  Users,
  Activity,
  FileText,
  ShieldCheck,
  Settings,
  ArrowLeft
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { useAuth } from '@/components/layout/AuthProvider';
import Avatar from '@/components/ui/Avatar';

const NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/usage', label: 'Usage & API', icon: Activity },
  { href: '/admin/logs', label: 'Logs', icon: FileText },
  { href: '/admin/audit', label: 'Audit activity', icon: ShieldCheck },
  { href: '/admin/settings', label: 'System settings', icon: Settings }
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-wind-bg">
        <div className="h-6 w-6 rounded-full border-2 border-wind-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-wind-bg">
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-wind-border bg-wind-surface">
        <div className="px-5 py-5">
          <Logo size={24} />
          <p className="text-xs text-wind-muted mt-1">Admin dashboard</p>
        </div>
        <nav className="flex-1 px-3">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors mb-0.5',
                  active
                    ? 'bg-wind-accentSoft text-wind-accent'
                    : 'text-wind-muted hover:bg-wind-surface2 hover:text-wind-text'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-wind-border p-3">
          <Link
            href="/chat"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-wind-muted hover:bg-wind-surface2 hover:text-wind-text transition-colors mb-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to app
          </Link>
          {user && (
            <div className="flex items-center gap-2 px-3 py-2">
              <Avatar name={user.name} color={user.avatarColor} size="sm" />
              <span className="text-sm text-wind-text truncate">{user.name}</span>
            </div>
          )}
        </div>
      </aside>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
