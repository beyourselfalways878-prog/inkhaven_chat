-- =============================================================================
-- InkHaven Chat — Production Schema
-- =============================================================================

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  ink_id TEXT UNIQUE NOT NULL,
  display_name TEXT,
  reputation INTEGER DEFAULT 50 CHECK (reputation >= 0 AND reputation <= 100),
  interests TEXT[] DEFAULT '{}',
  comfort_level TEXT DEFAULT 'balanced' CHECK (comfort_level IN ('gentle', 'balanced', 'bold')),
  is_ephemeral BOOLEAN DEFAULT true,
  aura_seed INTEGER DEFAULT floor(random() * 1000000)::int,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rooms
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT DEFAULT 'direct' CHECK (type IN ('direct', 'group', 'quick_match')),
  name TEXT,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Room participants (was missing — critical for RLS and matching)
CREATE TABLE IF NOT EXISTS public.room_participants (
  id BIGSERIAL PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(room_id, user_id)
);

-- Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id BIGSERIAL PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'audio', 'file', 'system')),
  reply_to BIGINT REFERENCES public.messages(id),
  metadata JSONB DEFAULT '{}',
  is_reported BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  moderation_status TEXT DEFAULT 'clean' CHECK (moderation_status IN ('clean', 'pending', 'flagged', 'removed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message read receipts
CREATE TABLE IF NOT EXISTS public.message_statuses (
  id BIGSERIAL PRIMARY KEY,
  message_id BIGINT NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('sent', 'delivered', 'read')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id, status)
);

-- Message reactions
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id BIGSERIAL PRIMARY KEY,
  message_id BIGINT NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id, reaction)
);

-- User blocks
CREATE TABLE IF NOT EXISTS public.user_blocks (
  id BIGSERIAL PRIMARY KEY,
  blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

-- User reports
CREATE TABLE IF NOT EXISTS public.user_reports (
  id BIGSERIAL PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  room_id UUID REFERENCES public.rooms(id),
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'inappropriate', 'underage', 'other')),
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User embeddings (AI matching)
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE IF NOT EXISTS public.user_embeddings (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  embedding vector(384),
  last_chat_embedding vector(384),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Match history (for learning and stats)
CREATE TABLE IF NOT EXISTS public.match_history (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  compatibility_score DECIMAL(3,2),
  feedback TEXT CHECK (feedback IN ('liked', 'skipped', 'reported')),
  messages_exchanged INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- Migrate existing tables (safe to re-run — all use IF NOT EXISTS)
-- =============================================================================

ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'direct';

ALTER TABLE public.room_participants ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.room_participants ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS reply_to BIGINT REFERENCES public.messages(id);
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text';
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS aura_seed INTEGER DEFAULT floor(random() * 1000000)::int;

-- =============================================================================
-- Performance Indexes
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_messages_room_created ON public.messages(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_user ON public.room_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_room ON public.room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_message_statuses_message ON public.message_statuses(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_message ON public.message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker ON public.user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_status ON public.user_reports(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_rooms_last_message ON public.rooms(last_message_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_match_history_user ON public.match_history(user_id, created_at DESC);

-- Vector Search Indexes (HNSW)
CREATE INDEX IF NOT EXISTS user_embeddings_embedding_idx ON public.user_embeddings USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS user_embeddings_chat_embedding_idx ON public.user_embeddings USING hnsw (last_chat_embedding vector_cosine_ops);

-- =============================================================================
-- Helper Functions (Security Definer to bypass RLS recursion)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.is_room_participant(_room_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.room_participants
    WHERE room_id = _room_id AND user_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.join_room(_room_id UUID, _user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.room_participants (room_id, user_id, joined_at, last_seen_at)
  VALUES (_room_id, _user_id, NOW(), NOW())
  ON CONFLICT (room_id, user_id) 
  DO UPDATE SET last_seen_at = NOW(), is_active = true;
END;
$$;

-- =============================================================================
-- Row Level Security (RLS) Policies & Permissions
-- =============================================================================

-- Grant permissions to authenticated users
GRANT ALL ON TABLE public.profiles TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.rooms TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.room_participants TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.messages TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_room_participant TO anon, authenticated, service_role;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Cleanup existing violations
DELETE FROM public.messages WHERE content ILIKE '%<script%';
DELETE FROM public.messages WHERE char_length(content) > 5000;

-- Security Hardening: XSS & Payload Limits
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_content_length_check;
ALTER TABLE public.messages ADD CONSTRAINT messages_content_length_check CHECK (char_length(content) <= 5000);

ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_content_xss_check;
ALTER TABLE public.messages ADD CONSTRAINT messages_content_xss_check CHECK (content NOT ILIKE '%<script%');

-- 1. Profiles: Public Read, Self Update
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Room Participants: Service Role Bypass & User View Own
DROP POLICY IF EXISTS "Service role full access" ON public.room_participants;
CREATE POLICY "Service role full access" ON public.room_participants FOR ALL USING (
  (auth.jwt() ->> 'role') = 'service_role'
) WITH CHECK (
  (auth.jwt() ->> 'role') = 'service_role'
);

DROP POLICY IF EXISTS "Users can view own participation" ON public.room_participants;
CREATE POLICY "Users can view own participation" ON public.room_participants FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 3. Messages: View/Insert if Participant
DROP POLICY IF EXISTS "Participants can view messages" ON public.messages;
CREATE POLICY "Participants can view messages" ON public.messages FOR SELECT USING (
  public.is_room_participant(room_id, auth.uid()) OR (auth.jwt() ->> 'role') = 'service_role'
);

DROP POLICY IF EXISTS "Participants can insert messages" ON public.messages;
CREATE POLICY "Participants can insert messages" ON public.messages FOR INSERT WITH CHECK (
  (auth.uid() = sender_id AND public.is_room_participant(room_id, auth.uid())) 
  OR (auth.jwt() ->> 'role') = 'service_role'
);

-- 4. Rooms: View if Participant
DROP POLICY IF EXISTS "Participants can view rooms" ON public.rooms;
CREATE POLICY "Participants can view rooms" ON public.rooms FOR SELECT USING (
  public.is_room_participant(id, auth.uid()) OR (auth.jwt() ->> 'role') = 'service_role'
);
