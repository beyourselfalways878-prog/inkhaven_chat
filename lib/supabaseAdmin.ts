import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!url || !serviceKey) {
  console.warn('Supabase admin client not configured. Set SUPABASE_SERVICE_ROLE_KEY in environment on server.');
}

export const supabaseAdmin = createClient(url ?? '', serviceKey ?? '', { auth: { persistSession: false } });
