import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../../lib/supabaseAdmin';
import { z } from 'zod';

const editSchema = z.object({
    content: z.string().min(1).max(5000),
    senderId: z.string().min(1),
});

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { content, senderId } = editSchema.parse(body);

        // Verify the message belongs to the sender
        const { data: existing, error: fetchErr } = await supabaseAdmin
            .from('messages')
            .select('sender_id, content')
            .eq('id', id)
            .single();

        if (fetchErr || !existing) {
            return NextResponse.json({ error: 'Message not found' }, { status: 404 });
        }

        if (existing.sender_id !== senderId) {
            return NextResponse.json({ error: 'You can only edit your own messages' }, { status: 403 });
        }

        // Update the message
        const { data, error } = await supabaseAdmin
            .from('messages')
            .update({
                content,
                edited_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ ok: true, message: data });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid edit parameters', details: err.issues }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
