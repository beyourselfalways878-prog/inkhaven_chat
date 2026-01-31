-- InkHaven Chat — Complete Database Schema
-- Professional production-ready Supabase backend
-- Single consolidated migration with all tables, RLS policies, and functions

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- User Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    ink_id TEXT UNIQUE NOT NULL,
    display_name TEXT,
    reputation INTEGER DEFAULT 50 CHECK (reputation >= 0 AND reputation <= 100),
    interests TEXT[] DEFAULT '{}',
    comfort_level TEXT DEFAULT 'balanced' CHECK (comfort_level IN ('gentle', 'balanced', 'bold')),
    is_ephemeral BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Rooms
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Room Participants
CREATE TABLE IF NOT EXISTS public.room_participants (
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_message_id BIGINT,
    typing_at TIMESTAMPTZ,
    PRIMARY KEY (room_id, user_id)
);

-- Messages
CREATE TABLE IF NOT EXISTS public.messages (
    id BIGSERIAL PRIMARY KEY,
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'audio', 'file', 'system')),
    file_url TEXT,
    file_name TEXT,
    file_size INTEGER,
    audio_duration INTEGER,
    is_reported BOOLEAN DEFAULT false,
    moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'flagged', 'removed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message Statuses (delivery/read receipts)
CREATE TABLE IF NOT EXISTS public.message_statuses (
    id BIGSERIAL PRIMARY KEY,
    message_id BIGINT REFERENCES public.messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('sent', 'delivered', 'read')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id, status)
);

-- Message Reactions
CREATE TABLE IF NOT EXISTS public.message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id BIGINT REFERENCES public.messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    reaction TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id, reaction)
);

-- ============================================================================
-- MATCHING TABLES
-- ============================================================================

-- User Interests (weighted for matching)
CREATE TABLE IF NOT EXISTS public.user_interests (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    interest TEXT NOT NULL,
    weight FLOAT DEFAULT 1 CHECK (weight >= 0 AND weight <= 10),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, interest)
);

-- Connection Queue (matching pool)
CREATE TABLE IF NOT EXISTS public.connection_queue (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    mode TEXT NOT NULL DEFAULT 'casual' CHECK (mode IN ('casual', 'deep')),
    interests TEXT[] DEFAULT '{}',
    comfort_level TEXT DEFAULT 'balanced',
    mood TEXT DEFAULT 'casual',
    vibe_score FLOAT DEFAULT 50 CHECK (vibe_score >= 0 AND vibe_score <= 100),
    skip_count INTEGER DEFAULT 0,
    waiting_since TIMESTAMPTZ DEFAULT NOW(),
    matched_with UUID,
    current_room_id UUID,
    last_match_at TIMESTAMPTZ
);

-- User Embeddings (for AI matching)
CREATE TABLE IF NOT EXISTS public.user_embeddings (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    embedding vector(384),
    last_chat_embedding vector(384),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Match History (for feedback learning)
CREATE TABLE IF NOT EXISTS public.match_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    partner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
    action TEXT NOT NULL CHECK (action IN ('matched', 'skipped', 'liked', 'reported')),
    conversation_duration INTEGER DEFAULT 0,
    messages_exchanged INTEGER DEFAULT 0,
    compatibility_score FLOAT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Preferences (learned over time)
CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    preferred_comfort_levels TEXT[] DEFAULT ARRAY['balanced'],
    preferred_interests TEXT[] DEFAULT '{}',
    avoid_interests TEXT[] DEFAULT '{}',
    min_reputation INTEGER DEFAULT 0,
    conversation_style TEXT DEFAULT 'balanced' CHECK (conversation_style IN ('brief', 'balanced', 'deep')),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- MODERATION & SAFETY TABLES
-- ============================================================================

-- User Blocks
CREATE TABLE IF NOT EXISTS public.user_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(blocker_id, blocked_id)
);

-- Banned Users
CREATE TABLE IF NOT EXISTS public.banned_users (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    banned_at TIMESTAMPTZ DEFAULT NOW(),
    banned_until TIMESTAMPTZ,
    reason TEXT NOT NULL,
    banned_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message Reports
CREATE TABLE IF NOT EXISTS public.message_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id BIGINT REFERENCES public.messages(id) ON DELETE SET NULL,
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'inappropriate', 'other')),
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Presence Status
CREATE TABLE IF NOT EXISTS public.presence_status (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'away', 'offline')),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_messages_room_created ON public.messages(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_room ON public.room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_user ON public.room_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_connection_queue_mode ON public.connection_queue(mode, matched_with);
CREATE INDEX IF NOT EXISTS idx_connection_queue_waiting ON public.connection_queue(waiting_since);
CREATE INDEX IF NOT EXISTS idx_match_history_user ON public.match_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_match_history_partner ON public.match_history(partner_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker ON public.user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked ON public.user_blocks(blocked_id);
CREATE INDEX IF NOT EXISTS idx_presence_status_updated ON public.presence_status(updated_at);
CREATE INDEX IF NOT EXISTS idx_message_reports_status ON public.message_reports(status, created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connection_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banned_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presence_status ENABLE ROW LEVEL SECURITY;

-- Profiles: own + room participants can view
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (
    auth.uid() = id OR auth.role() = 'service_role' OR
    EXISTS (SELECT 1 FROM room_participants rp1 JOIN room_participants rp2 
            ON rp1.room_id = rp2.room_id WHERE rp1.user_id = auth.uid() AND rp2.user_id = profiles.id)
);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id OR auth.role() = 'service_role');

-- Rooms: participants can view, auth can create
CREATE POLICY "rooms_select" ON public.rooms FOR SELECT USING (
    auth.role() = 'service_role' OR
    EXISTS (SELECT 1 FROM room_participants WHERE room_id = rooms.id AND user_id = auth.uid())
);
CREATE POLICY "rooms_insert" ON public.rooms FOR INSERT WITH CHECK (auth.role() IN ('authenticated', 'anon', 'service_role'));

-- Room Participants
CREATE POLICY "room_participants_select" ON public.room_participants FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');
CREATE POLICY "room_participants_insert" ON public.room_participants FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');
CREATE POLICY "room_participants_update" ON public.room_participants FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'service_role');
CREATE POLICY "room_participants_delete" ON public.room_participants FOR DELETE USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- Messages: room participants can view/insert
CREATE POLICY "messages_select" ON public.messages FOR SELECT USING (
    auth.role() = 'service_role' OR
    EXISTS (SELECT 1 FROM room_participants WHERE room_id = messages.room_id AND user_id = auth.uid())
);
CREATE POLICY "messages_insert" ON public.messages FOR INSERT WITH CHECK (
    auth.role() = 'service_role' OR
    EXISTS (SELECT 1 FROM room_participants WHERE room_id = messages.room_id AND user_id = auth.uid())
);

-- Message Statuses
CREATE POLICY "message_statuses_select" ON public.message_statuses FOR SELECT USING (auth.role() IN ('authenticated', 'anon', 'service_role'));
CREATE POLICY "message_statuses_insert" ON public.message_statuses FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Message Reactions
CREATE POLICY "message_reactions_select" ON public.message_reactions FOR SELECT USING (
    auth.role() = 'service_role' OR
    EXISTS (SELECT 1 FROM messages m JOIN room_participants rp ON m.room_id = rp.room_id 
            WHERE m.id = message_reactions.message_id AND rp.user_id = auth.uid())
);
CREATE POLICY "message_reactions_insert" ON public.message_reactions FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');
CREATE POLICY "message_reactions_delete" ON public.message_reactions FOR DELETE USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- User Interests
CREATE POLICY "user_interests_select" ON public.user_interests FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');
CREATE POLICY "user_interests_insert" ON public.user_interests FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');
CREATE POLICY "user_interests_update" ON public.user_interests FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'service_role');
CREATE POLICY "user_interests_delete" ON public.user_interests FOR DELETE USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- Connection Queue
CREATE POLICY "connection_queue_select" ON public.connection_queue FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');
CREATE POLICY "connection_queue_insert" ON public.connection_queue FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');
CREATE POLICY "connection_queue_update" ON public.connection_queue FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'service_role');
CREATE POLICY "connection_queue_delete" ON public.connection_queue FOR DELETE USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- User Embeddings (service role only for write)
CREATE POLICY "user_embeddings_select" ON public.user_embeddings FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');
CREATE POLICY "user_embeddings_insert" ON public.user_embeddings FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "user_embeddings_update" ON public.user_embeddings FOR UPDATE USING (auth.role() = 'service_role');

-- Match History
CREATE POLICY "match_history_select" ON public.match_history FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');
CREATE POLICY "match_history_insert" ON public.match_history FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- User Preferences
CREATE POLICY "user_preferences_select" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');
CREATE POLICY "user_preferences_insert" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');
CREATE POLICY "user_preferences_update" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- User Blocks
CREATE POLICY "user_blocks_select" ON public.user_blocks FOR SELECT USING (auth.uid() = blocker_id OR auth.role() = 'service_role');
CREATE POLICY "user_blocks_insert" ON public.user_blocks FOR INSERT WITH CHECK (auth.uid() = blocker_id OR auth.role() = 'service_role');
CREATE POLICY "user_blocks_delete" ON public.user_blocks FOR DELETE USING (auth.uid() = blocker_id OR auth.role() = 'service_role');

-- Banned Users (service role only)
CREATE POLICY "banned_users_all" ON public.banned_users FOR ALL USING (auth.role() = 'service_role');

-- Message Reports
CREATE POLICY "message_reports_select" ON public.message_reports FOR SELECT USING (auth.uid() = reporter_id OR auth.role() = 'service_role');
CREATE POLICY "message_reports_insert" ON public.message_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id OR auth.role() = 'service_role');

-- Presence Status (public read, own write)
CREATE POLICY "presence_status_select" ON public.presence_status FOR SELECT USING (true);
CREATE POLICY "presence_status_insert" ON public.presence_status FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');
CREATE POLICY "presence_status_update" ON public.presence_status FOR UPDATE USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- ============================================================================
-- DATABASE FUNCTIONS
-- ============================================================================

-- Update user presence
CREATE OR REPLACE FUNCTION update_presence(p_user_id UUID, p_status TEXT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.presence_status (user_id, status, last_seen_at, updated_at)
    VALUES (p_user_id, p_status, NOW(), NOW())
    ON CONFLICT (user_id) DO UPDATE SET status = EXCLUDED.status, last_seen_at = NOW(), updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get room participants with presence
CREATE OR REPLACE FUNCTION get_room_participants_with_presence(p_room_id UUID)
RETURNS TABLE (user_id UUID, display_name TEXT, ink_id TEXT, status TEXT, last_seen_at TIMESTAMPTZ, joined_at TIMESTAMPTZ) AS $$
BEGIN
    RETURN QUERY
    SELECT rp.user_id, p.display_name, p.ink_id, COALESCE(ps.status, 'offline'), COALESCE(ps.last_seen_at, rp.joined_at), rp.joined_at
    FROM public.room_participants rp
    JOIN public.profiles p ON p.id = rp.user_id
    LEFT JOIN public.presence_status ps ON ps.user_id = rp.user_id
    WHERE rp.room_id = p_room_id;
END;
$$ LANGUAGE plpgsql;

-- Check if user is banned
CREATE OR REPLACE FUNCTION is_user_banned(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM public.banned_users WHERE user_id = p_user_id AND (banned_until IS NULL OR banned_until > NOW()));
END;
$$ LANGUAGE plpgsql;

-- Check if users are blocked (bidirectional)
CREATE OR REPLACE FUNCTION is_user_blocked(p_user_id UUID, p_target_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM public.user_blocks WHERE (blocker_id = p_user_id AND blocked_id = p_target_id) OR (blocker_id = p_target_id AND blocked_id = p_user_id));
END;
$$ LANGUAGE plpgsql;

-- Get user reputation from match history
CREATE OR REPLACE FUNCTION get_user_reputation(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE v_reputation INTEGER;
BEGIN
    SELECT 50 + COALESCE(SUM(CASE 
        WHEN action = 'liked' THEN 5
        WHEN action = 'matched' AND conversation_duration > 300 THEN 3
        WHEN action = 'matched' AND messages_exchanged > 10 THEN 2
        WHEN action = 'skipped' THEN -1
        WHEN action = 'reported' THEN -10
        ELSE 0
    END), 0) INTO v_reputation FROM public.match_history WHERE partner_id = p_user_id;
    RETURN GREATEST(0, LEAST(100, v_reputation));
END;
$$ LANGUAGE plpgsql;

-- Set typing indicator
CREATE OR REPLACE FUNCTION set_typing(p_room_id UUID, p_user_id UUID, p_is_typing BOOLEAN)
RETURNS VOID AS $$
BEGIN
    UPDATE public.room_participants SET typing_at = CASE WHEN p_is_typing THEN NOW() ELSE NULL END WHERE room_id = p_room_id AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get typing users in room
CREATE OR REPLACE FUNCTION get_typing_users(p_room_id UUID)
RETURNS TABLE (user_id UUID, display_name TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT rp.user_id, p.display_name FROM public.room_participants rp
    JOIN public.profiles p ON p.id = rp.user_id
    WHERE rp.room_id = p_room_id AND rp.typing_at IS NOT NULL AND rp.typing_at > NOW() - INTERVAL '5 seconds';
END;
$$ LANGUAGE plpgsql;

-- Mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_read(p_room_id UUID, p_user_id UUID, p_message_id BIGINT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.room_participants SET last_seen_at = NOW(), last_seen_message_id = p_message_id WHERE room_id = p_room_id AND user_id = p_user_id;
    INSERT INTO public.message_statuses (message_id, user_id, status) VALUES (p_message_id, p_user_id, 'read') ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Find best vector match
CREATE OR REPLACE FUNCTION find_best_vector_match(p_user_id UUID, p_mode TEXT, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (user_id UUID, similarity_score FLOAT, interest_overlap INTEGER, vibe_score FLOAT) AS $$
BEGIN
    RETURN QUERY
    WITH user_embedding AS (SELECT embedding FROM public.user_embeddings WHERE user_embeddings.user_id = p_user_id),
         user_interests AS (SELECT ARRAY_AGG(interest) as interests FROM public.user_interests WHERE user_interests.user_id = p_user_id)
    SELECT cq.user_id,
        COALESCE(1 - (ue.embedding <=> (SELECT embedding FROM user_embedding)), 0.5) as similarity_score,
        COALESCE((SELECT COUNT(*)::INTEGER FROM UNNEST(cq.interests) AS i(interest) WHERE i.interest = ANY((SELECT interests FROM user_interests))), 0) as interest_overlap,
        cq.vibe_score
    FROM public.connection_queue cq
    LEFT JOIN public.user_embeddings ue ON ue.user_id = cq.user_id
    WHERE cq.user_id != p_user_id AND cq.mode = p_mode AND cq.matched_with IS NULL
    AND NOT EXISTS (SELECT 1 FROM public.match_history mh WHERE mh.user_id = p_user_id AND mh.partner_id = cq.user_id AND mh.action = 'skipped' AND mh.created_at > NOW() - INTERVAL '24 hours')
    AND NOT EXISTS (SELECT 1 FROM public.banned_users bu WHERE bu.user_id = cq.user_id)
    AND NOT EXISTS (SELECT 1 FROM public.user_blocks ub WHERE (ub.blocker_id = p_user_id AND ub.blocked_id = cq.user_id) OR (ub.blocker_id = cq.user_id AND ub.blocked_id = p_user_id))
    ORDER BY (COALESCE(1 - (ue.embedding <=> (SELECT embedding FROM user_embedding)), 0.5) * 0.4) +
             (COALESCE((SELECT COUNT(*) FROM UNNEST(cq.interests) AS i(interest) WHERE i.interest = ANY((SELECT interests FROM user_interests)))::FLOAT / GREATEST(ARRAY_LENGTH(cq.interests, 1), 1), 0) * 0.3) +
             (cq.vibe_score / 100 * 0.2) + (EXTRACT(EPOCH FROM (NOW() - cq.waiting_since)) / 600 * 0.1) DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- REALTIME
-- ============================================================================

DO $$
BEGIN
    BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.messages; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.message_statuses; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.room_participants; EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.presence_status; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- ============================================================================
-- STORAGE
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('audio', 'audio', false, 52428800, ARRAY['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/ogg'])
ON CONFLICT (id) DO NOTHING;
