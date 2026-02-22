-- =============================================================================
-- Migration 002: Add banned_users table
-- =============================================================================
-- This table stores user bans for moderation purposes.
-- Can be run idempotently (uses IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS public.banned_users (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL DEFAULT 'moderation',
  banned_by UUID REFERENCES public.profiles(id),
  banned_at TIMESTAMPTZ DEFAULT NOW(),
  banned_until TIMESTAMPTZ,  -- NULL = permanent ban
  expires_at TIMESTAMPTZ,     -- Alias, kept for backwards compat
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_banned_users_user_id ON public.banned_users(user_id);

-- RLS
ALTER TABLE public.banned_users ENABLE ROW LEVEL SECURITY;

-- Only admins (service role) can manage bans
CREATE POLICY "banned_users_admin_only" ON public.banned_users
  FOR ALL
  USING (false)
  WITH CHECK (false);
-- Service role key bypasses RLS, so admin operations still work
