/**
 * GET /api/messages/[id]/reactions
 * Fetch reactions for a specific message
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../../lib/supabaseAdmin';

// Local cache for mock mode (serverless-safe, same as toggle route)
const mockReactions: Map<string, Array<{ id: string; user_id: string; reaction: string; created_at: string }>> = new Map();

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // If Supabase admin isn't configured, fall back to local cache for tests
    const forceMock = process.env.NEXT_PUBLIC_USE_MOCK_CHAT === '1' || process.env.NEXT_PUBLIC_USE_MOCK_CHAT === 'true';
    if (forceMock || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const reactions = mockReactions.get(id) || [];
      return NextResponse.json({ ok: true, reactions });
    }

    const { data } = await supabaseAdmin
      .from('message_reactions')
      .select('id, message_id, user_id, reaction, created_at')
      .eq('message_id', id);

    return NextResponse.json({ ok: true, reactions: data ?? [] });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}