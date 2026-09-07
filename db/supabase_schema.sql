-- ========================================================================
-- Wind AI - Supabase PostgreSQL Schema & Migrations
-- Copy and paste this into your Supabase Dashboard -> SQL Editor and Run.
-- ========================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  avatar_color VARCHAR(20) NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- 2. User Settings
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  theme VARCHAR(20) NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  default_model VARCHAR(60) NOT NULL DEFAULT 'gemini-2.0-flash',
  temperature NUMERIC(3,1) NOT NULL DEFAULT 0.7,
  custom_instructions TEXT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL DEFAULT 'New chat',
  pinned BOOLEAN NOT NULL DEFAULT FALSE,
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  model VARCHAR(60) NOT NULL DEFAULT 'gemini-2.0-flash',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conv_user_updated ON public.conversations(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conv_archived ON public.conversations(archived);

-- 4. Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'complete' CHECK (status IN ('complete', 'streaming', 'error', 'stopped')),
  error_message VARCHAR(500) NULL,
  token_count INT NULL,
  edited BOOLEAN NOT NULL DEFAULT FALSE,
  attachment TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_msg_conv_created ON public.messages(conversation_id, created_at ASC);

-- 5. API Usage Logs
CREATE TABLE IF NOT EXISTS public.api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL REFERENCES public.users(id) ON DELETE SET NULL,
  conversation_id UUID NULL REFERENCES public.conversations(id) ON DELETE SET NULL,
  model VARCHAR(60) NOT NULL,
  prompt_tokens INT NOT NULL DEFAULT 0,
  completion_tokens INT NOT NULL DEFAULT 0,
  latency_ms INT NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'error', 'rate_limited')),
  error_message VARCHAR(500) NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_created ON public.api_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_user ON public.api_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_status ON public.api_usage_logs(status);

-- 6. Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NULL,
  actor_email VARCHAR(190) NULL,
  action VARCHAR(120) NOT NULL,
  target_type VARCHAR(60) NULL,
  target_id VARCHAR(60) NULL,
  metadata JSONB NULL,
  ip_address VARCHAR(64) NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON public.audit_logs(action);

-- 7. System Settings
CREATE TABLE IF NOT EXISTS public.system_settings (
  key VARCHAR(80) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID NULL
);

INSERT INTO public.system_settings (key, value) VALUES
  ('default_model', '"gemini-2.0-flash"'::jsonb),
  ('maintenance_mode', 'false'::jsonb),
  ('max_messages_per_day', '200'::jsonb),
  ('signup_enabled', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 8. Rate Limit Hits
CREATE TABLE IF NOT EXISTS public.rate_limit_hits (
  id BIGSERIAL PRIMARY KEY,
  bucket_key VARCHAR(190) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_bucket_time ON public.rate_limit_hits(bucket_key, created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Allow public access with anon key for app backend / service
CREATE POLICY "Allow select on users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow insert on users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on users" ON public.users FOR UPDATE USING (true);

CREATE POLICY "Allow all on user_settings" ON public.user_settings FOR ALL USING (true);
CREATE POLICY "Allow all on conversations" ON public.conversations FOR ALL USING (true);
CREATE POLICY "Allow all on messages" ON public.messages FOR ALL USING (true);
CREATE POLICY "Allow all on api_usage_logs" ON public.api_usage_logs FOR ALL USING (true);
CREATE POLICY "Allow all on audit_logs" ON public.audit_logs FOR ALL USING (true);
CREATE POLICY "Allow all on system_settings" ON public.system_settings FOR ALL USING (true);
