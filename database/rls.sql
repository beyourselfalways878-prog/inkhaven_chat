-- =============================================================================
-- InkHaven Chat — Production Row Level Security
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_history ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- PROFILES
-- =============================================================================

-- Users can read any profile's public info (display_name, reputation, interests)
CREATE POLICY "profiles_select_public" ON public.profiles
  FOR SELECT USING (true);

-- Users can only update their own profile
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (during onboarding)
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =============================================================================
-- ROOMS
-- =============================================================================

-- Users can see rooms they participate in
CREATE POLICY "rooms_select_participant" ON public.rooms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.room_participants
      WHERE room_id = rooms.id AND user_id = auth.uid()
    )
  );

-- Room creation is handled by service role (server-side only)
CREATE POLICY "rooms_insert_service" ON public.rooms
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- =============================================================================
-- ROOM PARTICIPANTS
-- =============================================================================

-- Users can see participants in their rooms
CREATE POLICY "room_participants_select_member" ON public.room_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.room_participants rp
      WHERE rp.room_id = room_participants.room_id AND rp.user_id = auth.uid()
    )
  );

-- Joining is handled by service role
CREATE POLICY "room_participants_insert_service" ON public.room_participants
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Users can update their own participation (last_seen_at)
CREATE POLICY "room_participants_update_own" ON public.room_participants
  FOR UPDATE USING (user_id = auth.uid());

-- =============================================================================
-- MESSAGES
-- =============================================================================

-- Users can read messages only in rooms they participate in
CREATE POLICY "messages_select_participant" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.room_participants
      WHERE room_id = messages.room_id AND user_id = auth.uid()
    )
  );

-- Users can send messages only to rooms they participate in
CREATE POLICY "messages_insert_participant" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.room_participants
      WHERE room_id = messages.room_id AND user_id = auth.uid()
    )
  );

-- Users can soft-delete their own messages
CREATE POLICY "messages_update_own" ON public.messages
  FOR UPDATE USING (auth.uid() = sender_id);

-- =============================================================================
-- MESSAGE STATUSES (read receipts)
-- =============================================================================

CREATE POLICY "message_statuses_select_participant" ON public.message_statuses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.messages m
      JOIN public.room_participants rp ON rp.room_id = m.room_id
      WHERE m.id = message_statuses.message_id AND rp.user_id = auth.uid()
    )
  );

CREATE POLICY "message_statuses_insert_own" ON public.message_statuses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- MESSAGE REACTIONS
-- =============================================================================

CREATE POLICY "message_reactions_select_all" ON public.message_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.messages m
      JOIN public.room_participants rp ON rp.room_id = m.room_id
      WHERE m.id = message_reactions.message_id AND rp.user_id = auth.uid()
    )
  );

CREATE POLICY "message_reactions_insert_own" ON public.message_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "message_reactions_delete_own" ON public.message_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- USER BLOCKS
-- =============================================================================

CREATE POLICY "user_blocks_select_own" ON public.user_blocks
  FOR SELECT USING (auth.uid() = blocker_id);

CREATE POLICY "user_blocks_insert_own" ON public.user_blocks
  FOR INSERT WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "user_blocks_delete_own" ON public.user_blocks
  FOR DELETE USING (auth.uid() = blocker_id);

-- =============================================================================
-- USER REPORTS
-- =============================================================================

CREATE POLICY "user_reports_insert_own" ON public.user_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Users can see their own reports
CREATE POLICY "user_reports_select_own" ON public.user_reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- =============================================================================
-- USER EMBEDDINGS
-- =============================================================================

CREATE POLICY "user_embeddings_select_own" ON public.user_embeddings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_embeddings_manage_service" ON public.user_embeddings
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- MATCH HISTORY
-- =============================================================================

CREATE POLICY "match_history_select_own" ON public.match_history
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = partner_id);

CREATE POLICY "match_history_insert_service" ON public.match_history
  FOR INSERT WITH CHECK (auth.role() = 'service_role');
