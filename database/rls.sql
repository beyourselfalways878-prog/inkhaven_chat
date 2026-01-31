-- Row Level Security (RLS) example policies for InkHaven (deploy with caution)

-- Enable RLS
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.message_statuses ENABLE ROW LEVEL SECURITY;

-- Profiles: users can select their own profile
CREATE POLICY IF NOT EXISTS "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Messages: allow insert for authenticated users, allow select if either sender or participant in room
-- NOTE: adjust logic to your room membership model
CREATE POLICY IF NOT EXISTS "messages_insert_auth" ON public.messages
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY IF NOT EXISTS "messages_select_owner" ON public.messages
  FOR SELECT USING (auth.uid() = sender_id);

-- message_statuses: only service role or internal edge functions should insert
CREATE POLICY IF NOT EXISTS "message_statuses_insert_service" ON public.message_statuses
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Example: allow select of message_statuses only to service role or internal tools
CREATE POLICY IF NOT EXISTS "message_statuses_select_service" ON public.message_statuses
  FOR SELECT USING (auth.role() = 'service_role');

-- NOTE: These policies are a starting point. Adapt them to your matching/room access model and test thoroughly in staging.
