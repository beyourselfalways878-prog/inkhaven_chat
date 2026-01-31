/**
 * Reactions Toggle API
 * POST: Toggle a reaction on a message
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

const reactionSchema = z.object({
  messageId: z.string().min(1, 'Message ID required'),
  userId: z.string().min(1, 'User ID required'),
  reaction: z.string().max(10, 'Reaction too long')
});

// Local cache for mock mode (serverless-safe)
const mockReactions: Map<string, Array<{ id: string; user_id: string; reaction: string; created_at: string }>> = new Map();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = reactionSchema.parse(body);
    const { messageId, userId, reaction } = validated;

    // Mock mode for development/testing
    const forceMock = process.env.NEXT_PUBLIC_USE_MOCK_CHAT === '1' || process.env.NEXT_PUBLIC_USE_MOCK_CHAT === 'true';

    if (forceMock || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const existing = mockReactions.get(messageId) || [];
      const idx = existing.findIndex((r) => r.user_id === userId && r.reaction === reaction);

      if (idx >= 0) {
        existing.splice(idx, 1);
      } else {
        existing.push({
          id: `r_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          user_id: userId,
          reaction,
          created_at: new Date().toISOString()
        });
      }

      mockReactions.set(messageId, existing);
      return NextResponse.json({ ok: true, reactions: existing });
    }

    // Production: Use Supabase
    const { data: existing } = await supabaseAdmin
      .from('message_reactions')
      .select('*')
      .eq('message_id', messageId)
      .eq('user_id', userId)
      .eq('reaction', reaction)
      .limit(1);

    if (existing && existing.length > 0) {
      await supabaseAdmin.from('message_reactions').delete().eq('id', existing[0].id);
    } else {
      await supabaseAdmin.from('message_reactions').insert({
        message_id: messageId,
        user_id: userId,
        reaction
      });
    }

    const { data: all } = await supabaseAdmin
      .from('message_reactions')
      .select('id, message_id, user_id, reaction, created_at')
      .eq('message_id', messageId);

    return NextResponse.json({ ok: true, reactions: all ?? [] });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}