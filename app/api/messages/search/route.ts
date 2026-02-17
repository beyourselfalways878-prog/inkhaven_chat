import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import { z } from 'zod';

const searchSchema = z.object({
    roomId: z.string().min(1),
    query: z.string().min(1).max(200),
    limit: z.number().int().min(1).max(50).optional().default(20),
    offset: z.number().int().min(0).optional().default(0),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { roomId, query, limit, offset } = searchSchema.parse(body);

        const { data, error, count } = await supabaseAdmin
            .from('messages')
            .select('*', { count: 'exact' })
            .eq('room_id', roomId)
            .ilike('content', `%${query}%`)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            ok: true,
            messages: data ?? [],
            total: count ?? 0,
            hasMore: (count ?? 0) > offset + limit,
        });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid search parameters', details: err.issues }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
