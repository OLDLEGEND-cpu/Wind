'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Mail, Shield, Calendar, Palette, KeyRound, Check } from 'lucide-react';
import { useAuth } from '@/components/layout/AuthProvider';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Avatar from '@/components/ui/Avatar';
import { useToast } from '@/components/ui/Toast';

const AVATAR_COLORS = [
  '#6366f1', // Indigo
  '#3b82f6', // Blue
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#111827'  // Dark slate
];

export default function ProfilePage() {
  const { user, refresh } = useAuth();
  const toast = useToast();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setColor(user.avatarColor || '#6366f1');
    }
  }, [user]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, avatarColor: color })
      });
      if (!res.ok) throw new Error();
      await refresh();
      toast.push('Profile updated successfully', 'success');
    } catch {
      toast.push('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  return (
    <div className="h-full overflow-y-auto bg-wind-bg">
      <div className="mx-auto max-w-2xl px-6 py-8">
        <Link
          href="/chat"
          className="inline-flex items-center gap-1.5 text-sm text-wind-muted hover:text-wind-text mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to chat
        </Link>

        <h1 className="text-2xl font-semibold text-wind-text mb-2">My Profile</h1>
        <p className="text-sm text-wind-muted mb-8">Manage your personal account details and preferences.</p>

        {/* Profile Card */}
        <div className="rounded-2xl border border-wind-border bg-wind-surface p-6 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-wind-border">
            <Avatar name={name || user.name} color={color} size="lg" />
            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h2 className="text-lg font-semibold text-wind-text">{user.name}</h2>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  user.role === 'admin'
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                    : 'bg-wind-surface2 text-wind-muted'
                }`}>
                  <Shield className="h-3 w-3" /> {user.role}
                </span>
              </div>
              <p className="text-sm text-wind-muted flex items-center justify-center sm:justify-start gap-1.5">
                <Mail className="h-3.5 w-3.5" /> {user.email}
              </p>
            </div>
            {user.role === 'admin' && (
              <Link
                href="/admin"
                className="rounded-xl border border-purple-200 bg-purple-50 dark:bg-purple-950/40 dark:border-purple-800 px-3 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 hover:opacity-90"
              >
                Admin Portal
              </Link>
            )}
          </div>

          <div className="pt-6 space-y-6">
            <div>
              <Input
                label="Display Name"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-wind-text flex items-center gap-2 mb-2.5">
                <Palette className="h-4 w-4 text-wind-accent" /> Avatar Accent Color
              </label>
              <div className="flex flex-wrap gap-2.5">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{ backgroundColor: c }}
                    className="h-8 w-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none ring-2 ring-offset-2 ring-transparent"
                  >
                    {color === c && <Check className="h-4 w-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={handleSave} loading={saving}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>

        {/* Security & Password */}
        <div className="rounded-2xl border border-wind-border bg-wind-surface p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-wind-surface2 p-2.5 text-wind-muted">
                <KeyRound className="h-5 w-5 text-wind-accent" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-wind-text">Password & Security</h3>
                <p className="text-xs text-wind-muted">Update your account password or request a reset token.</p>
              </div>
            </div>
            <Link
              href="/forgot-password"
              className="rounded-xl border border-wind-border px-3 py-1.5 text-xs font-semibold text-wind-text hover:bg-wind-surface2 transition-colors"
            >
              Change Password
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
