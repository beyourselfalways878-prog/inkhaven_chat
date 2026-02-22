import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '../../../../lib/auth';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import { createLogger } from '../../../../lib/logger/Logger';

const logger = createLogger('ReportAPI');

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser(req);
        const { reportedId, roomId, reason } = await req.json();

        if (!reportedId || !reason) {
            return NextResponse.json({ ok: false, message: 'Missing reportedId or reason' }, { status: 400 });
        }

        const { error } = await supabaseAdmin.from('reports').insert({
            reporter_id: user.id,
            reported_id: reportedId,
            room_id: roomId,
            reason: reason,
        });

        if (error) throw error;

        logger.info('User reported successfully', { reporter_id: user.id, reported_id: reportedId });

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        logger.error('Failed to report user', { error: e.message });
        return NextResponse.json({ ok: false, message: e.message }, { status: 500 });
    }
}
