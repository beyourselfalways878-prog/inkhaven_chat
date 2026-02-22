import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '../../../../lib/auth';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import { createLogger } from '../../../../lib/logger/Logger';

const logger = createLogger('BlockAPI');

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser(req);
        const { blockedId } = await req.json();

        if (!blockedId) {
            return NextResponse.json({ ok: false, message: 'Missing blockedId' }, { status: 400 });
        }

        const { error } = await supabaseAdmin.from('blocks').upsert({
            blocker_id: user.id,
            blocked_id: blockedId,
        });

        if (error) throw error;

        // Ensure to remove them from any current matches or quick queues if needed.
        // We'll also want `quickMatchService` to respect blocks in the future.
        // Actually quick match logic needs an update, which we'll do next.

        logger.info('User blocked successfully', { blocker_id: user.id, blocked_id: blockedId });

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        logger.error('Failed to block user', { error: e.message });
        return NextResponse.json({ ok: false, message: e.message }, { status: 500 });
    }
}
