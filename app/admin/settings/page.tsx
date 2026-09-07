'use client';

import { useEffect, useState } from 'react';
import { PageHeader, LoadingRows } from '@/components/admin/Primitives';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const toast = useToast();

  async function load() {
    const res = await fetch('/api/admin/settings', { cache: 'no-store' });
    const data = await res.json();
    setSettings(data.settings);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateSetting(key: string, value: unknown) {
    setSaving(key);
    try {
      await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });
      setSettings((prev: any) => ({ ...prev, [key]: value }));
      toast.push('Setting updated', 'success');
    } catch {
      toast.push('Could not update setting', 'error');
    } finally {
      setSaving(null);
    }
  }

  if (!settings) {
    return (
      <div>
        <PageHeader title="System settings" />
        <LoadingRows />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="System settings" subtitle="Global configuration for Wind AI" />

      <div className="px-6 sm:px-8 py-6 max-w-2xl flex flex-col gap-4">
        <SettingRow
          title="Sign-ups enabled"
          description="Allow new users to register for Wind AI."
          value={settings.signup_enabled}
          saving={saving === 'signup_enabled'}
          onToggle={(v) => updateSetting('signup_enabled', v)}
        />
        <SettingRow
          title="Maintenance mode"
          description="Temporarily disable chat access for non-admins."
          value={settings.maintenance_mode}
          saving={saving === 'maintenance_mode'}
          onToggle={(v) => updateSetting('maintenance_mode', v)}
        />

        <div className="rounded-2xl border border-wind-border bg-wind-surface p-5">
          <p className="font-medium text-wind-text mb-1">Default model</p>
          <p className="text-sm text-wind-muted mb-3">Model assigned to new conversations by default.</p>
          <select
            value={settings.default_model}
            onChange={(e) => updateSetting('default_model', e.target.value)}
            className="h-10 rounded-lg border border-wind-border bg-wind-surface px-3 text-sm focus:outline-none"
          >
            <option value="gemini-3.6-flash">Wind Fast (gemini-3.6-flash)</option>
            <option value="gemini-3.7-flash">Wind Pro (gemini-3.7-flash)</option>
          </select>
        </div>

        <div className="rounded-2xl border border-wind-border bg-wind-surface p-5">
          <p className="font-medium text-wind-text mb-1">Max messages per user / day</p>
          <p className="text-sm text-wind-muted mb-3">Soft cap used for abuse prevention reporting.</p>
          <input
            type="number"
            defaultValue={settings.max_messages_per_day}
            onBlur={(e) => updateSetting('max_messages_per_day', Number(e.target.value))}
            className="h-10 w-32 rounded-lg border border-wind-border bg-wind-surface px-3 text-sm focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}

function SettingRow({
  title,
  description,
  value,
  saving,
  onToggle
}: {
  title: string;
  description: string;
  value: boolean;
  saving: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <div className="rounded-2xl border border-wind-border bg-wind-surface p-5 flex items-center justify-between gap-4">
      <div>
        <p className="font-medium text-wind-text">{title}</p>
        <p className="text-sm text-wind-muted">{description}</p>
      </div>
      <Button variant={value ? 'primary' : 'secondary'} size="sm" loading={saving} onClick={() => onToggle(!value)}>
        {value ? 'Enabled' : 'Disabled'}
      </Button>
    </div>
  );
}
