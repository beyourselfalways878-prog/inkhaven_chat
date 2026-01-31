import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not set. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local');
}

const createMockSupabase = () => {
  const mock: Partial<SupabaseClient> = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }) as any,
      signInAnonymously: async () => ({
        data: {
          user: { id: `local_${Math.random().toString(36).slice(2, 10)}` },
          session: { access_token: 'local_token' }
        },
        error: null
      }) as any
    } as any
  };
  return mock as SupabaseClient;
};

export const supabase: SupabaseClient = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: { params: { eventsPerSecond: 50 } }
    })
  : createMockSupabase();
