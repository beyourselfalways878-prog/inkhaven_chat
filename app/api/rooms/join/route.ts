import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

export async function POST(req: NextRequest) {
    try {
        const { userId, roomId } = await req.json();

        if (!userId || !roomId) {
            return NextResponse.json({ error: 'userId and roomId are required' }, { status: 400 });
        }

        // Upsert: if already a participant, just update last_seen_at
        const { error } = await supabaseAdmin
            .from('room_participants')
            .upsert(
                { user_id: userId, room_id: roomId, is_active: true, last_seen_at: new Date().toISOString() },
                { onConflict: 'room_id,user_id' }
            );

        if (error) {
            console.error('Failed to join room:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error('Room join error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
