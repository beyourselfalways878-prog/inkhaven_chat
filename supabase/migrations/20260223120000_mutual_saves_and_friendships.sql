-- Migration: Add Mutual Chat Saves and Friendships

-- Table for tracking who saved which room
CREATE TABLE IF NOT EXISTS public.chat_saves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(room_id, user_id)
);

-- Table for tracking friendships
CREATE TABLE IF NOT EXISTS public.friendships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('active', 'blocked')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Ensure user1 is always the alphabetically smaller UUID to prevent A->B and B->A duplicates
    CONSTRAINT user1_lt_user2 CHECK (user1_id < user2_id),
    UNIQUE(user1_id, user2_id)
);

-- Add comments for documentation
COMMENT ON TABLE public.chat_saves IS 'Tracks individual intent to save a chat room. When both users save, a friendship is formed.';
COMMENT ON TABLE public.friendships IS 'Tracks mutual saves/friendships between users. Requires two entries in chat_saves for the same room_id.';

-- RLS for chat_saves
ALTER TABLE public.chat_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own chat saves"
    ON public.chat_saves FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own chat saves"
    ON public.chat_saves FOR SELECT
    USING (auth.uid() = user_id);
    
-- (The backend API will look up the partner's save using the service role)

-- RLS for friendships
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own friendships"
    ON public.friendships FOR SELECT
    USING (auth.uid() = user1_id OR auth.uid() = user2_id);
    
-- System creates friendships via service role, so no user insert policy needed
