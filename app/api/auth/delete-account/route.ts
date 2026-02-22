import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '../../../../lib/auth';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import { createLogger } from '../../../../lib/logger/Logger';

const logger = createLogger('DeleteAccountAPI');

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser(req);

        // Delete user via the service role client
        const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);

        if (error) {
            throw error;
        }

        logger.info('User account permanently deleted', { userId: user.id });

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        logger.error('Failed to delete user account', { error: e.message });
        return NextResponse.json({ ok: false, message: e.message }, { status: 500 });
    }
}
