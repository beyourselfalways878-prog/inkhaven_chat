-- Core schema for InkHaven Chat (Phase 1)

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  ink_id TEXT UNIQUE NOT NULL,
  display_name TEXT,
  reputation INTEGER DEFAULT 50,
  interests TEXT[] DEFAULT '{}',
  comfort_level TEXT DEFAULT 'balanced',
  is_ephemeral BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rooms
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id BIGSERIAL PRIMARY KEY,
  room_id UUID REFERENCES public.rooms,
  sender_id UUID REFERENCES public.profiles,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  is_reported BOOLEAN DEFAULT false,
  moderation_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- User embeddings (for future matching)
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE IF NOT EXISTS public.user_embeddings (
  user_id UUID PRIMARY KEY,
  embedding vector(384),
  last_chat_embedding vector(384),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message statuses for server-driven lifecycle
CREATE TABLE IF NOT EXISTS public.message_statuses (
  id BIGSERIAL PRIMARY KEY,
  message_id TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS placeholder: enforce RLS in production
-- NOTE: Define policies after creating roles/stubs. Example:
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow users to select their profile" ON public.profiles
--   FOR SELECT USING (auth.uid() = id);
