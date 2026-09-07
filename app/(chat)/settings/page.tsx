'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/layout/AuthProvider';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Avatar from '@/components/ui/Avatar';
import { useToast } from '@/components/ui/Toast';
import { AVAILABLE_MODELS_CLIENT } from '@/lib/clientConstants';

export default function SettingsPage() {
  const { user, settings, refresh } = useAuth();
  const toast = useToast();
  const [name, setName] = useState('');
  const [defaultModel, setDefaultModel] = useState('gemini-3.6-flash');
  const [temperature, setTemperature] = useState(0.7);
  const [customInstructions, setCustomInstructions] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setName(user.name);
    if (settings) {
      setDefaultModel(settings.defaultModel);
      setTemperature(settings.temperature);
      setCustomInstructions(settings.customInstructions || '');
    }
  }, [user, settings]);

  async function saveProfile() {
    setSaving(true);
    try {
      await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      await refresh();
      toast.push('Profile updated', 'success');
    } catch {
      toast.push('Could not update profile', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function savePreferences() {
    setSaving(true);
    try {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ defaultModel, temperature, customInstructions })
      });
      await refresh();
      toast.push('Preferences saved', 'success');
    } catch {
      toast.push('Could not save preferences', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl px-6 py-8">
        <Link href="/chat" className="inline-flex items-center gap-1.5 text-sm text-wind-muted hover:text-wind-text mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to chat
        </Link>

        <h1 className="text-2xl font-semibold text-wind-text mb-8">Settings</h1>

        <section className="mb-10">
          <h2 className="text-sm font-semibold text-wind-text mb-4">Profile</h2>
          <div className="rounded-2xl border border-wind-border bg-wind-surface p-5">
            <div className="flex items-center gap-4 mb-5">
              <Avatar name={user.name} color={user.avatarColor} size="lg" />
              <div>
                <p className="font-medium text-wind-text">{user.name}</p>
                <p className="text-sm text-wind-muted">{user.email}</p>
              </div>
            </div>
            <Input label="Display name" value={name} onChange={(e) => setName(e.target.value)} />
            <div className="flex justify-end mt-4">
              <Button onClick={saveProfile} loading={saving} size="sm">
                Save profile
              </Button>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-semibold text-wind-text mb-4">AI preferences</h2>
          <div className="rounded-2xl border border-wind-border bg-wind-surface p-5 flex flex-col gap-5">
            <div>
              <label className="text-sm font-medium text-wind-text block mb-1.5">Default model</label>
              <select
                value={defaultModel}
                onChange={(e) => setDefaultModel(e.target.value)}
                className="w-full h-11 rounded-xl border border-wind-border bg-wind-surface px-3.5 text-sm text-wind-text focus:outline-none focus:border-wind-accent"
              >
                {AVAILABLE_MODELS_CLIENT.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label} — {m.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-wind-text">Response creativity</label>
                <span className="text-xs text-wind-muted">{temperature.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={1.5}
                step={0.1}
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full accent-wind-accent"
              />
              <div className="flex justify-between text-[11px] text-wind-muted mt-1">
                <span>Precise</span>
                <span>Creative</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-wind-text block mb-1.5">
                Custom instructions
              </label>
              <Textarea
                rows={4}
                placeholder="Tell Wind how you'd like it to respond — tone, format, expertise level..."
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={savePreferences} loading={saving} size="sm">
                Save preferences
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
