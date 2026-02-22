/**
 * Consolidated Moderation API
 * All moderation actions: check, report, ban, list reports, resolve
 */

import { NextRequest, NextResponse } from 'next/server';
import { moderationService } from '../../../lib/services/ModerationService';
import { handleApiError, generateRequestId } from '../../../lib/middleware/errorHandler';
import { checkModerationSchema, reportMessageSchema } from '../../../lib/schemas';
import { logger } from '../../../lib/logger/Logger';
import { rateLimit } from '../../../lib/rateLimit';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { z } from 'zod';

// Admin user IDs from environment variable (comma-separated UUIDs)
const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || '').split(',').filter(Boolean);

async function verifyAdminAuth(req: Request): Promise<boolean> {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) return false;

    try {
        // Use getUser with JWT token (not getUserById which expects UUID)
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
        if (error || !user) return false;

        // Check against admin user list from env
        return ADMIN_USER_IDS.includes(user.id);
    } catch {
        return false;
    }
}

const banSchema = z.object({
    userId: z.string().min(1),
    reason: z.string().max(500).optional()
});

const resolveSchema = z.object({
    reportId: z.string().min(1),
    resolution: z.enum(['dismissed', 'actioned'])
});

export async function GET(req: Request) {
    try {
        if (!(await verifyAdminAuth(req))) {
            return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
        }

        const { data, error } = await supabaseAdmin
            .from('user_reports')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(200);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        return NextResponse.json({ ok: true, reports: data ?? [] });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const requestId = generateRequestId();

    try {
        const ip = req.headers.get('x-forwarded-for') ?? 'local';
        const body = await req.json();
        const action = body.action || 'check';

        logger.info(`POST /api/moderation`, { action, requestId });

        // Rate limiting
        const limit = await rateLimit(`moderation:${ip}`, 50, 60);
        if (!limit.allowed) {
            return NextResponse.json({ ok: false, error: 'RATE_LIMITED' }, { status: 429 });
        }

        // Check content moderation
        if (action === 'check') {
            const validated = checkModerationSchema.parse(body);
            const mode = body.mode || 'safe';
            const result = await moderationService.checkContent(validated.text, mode);

            logger.info('Content moderation check completed', { requestId, flagged: result.flagged });
            return NextResponse.json({ ok: true, data: result });
        }

        // Report a message
        if (action === 'report') {
            const reportLimit = await rateLimit(`moderation:report:${ip}`, 10, 60);
            if (!reportLimit.allowed) {
                return NextResponse.json({ ok: false, error: 'RATE_LIMITED' }, { status: 429 });
            }

            const validated = reportMessageSchema.parse(body);
            const report = await moderationService.reportMessage(
                validated.messageId,
                validated.reporterId,
                validated.reason,
                validated.description
            );

            logger.info('Message reported successfully', { requestId, reportId: report.id });
            return NextResponse.json({ ok: true, data: report }, { status: 201 });
        }

        // Ban user (admin only)
        if (action === 'ban') {
            if (!(await verifyAdminAuth(req))) {
                return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
            }

            const validated = banSchema.parse(body);
            const ban = await moderationService.banUser(
                validated.userId,
                validated.reason ?? 'moderation'
            );
            return NextResponse.json({ ok: true, data: ban });
        }

        // Resolve report (admin only)
        if (action === 'resolve') {
            if (!(await verifyAdminAuth(req))) {
                return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
            }

            const validated = resolveSchema.parse(body);
            const resolved = await moderationService.resolveReport(
                validated.reportId,
                validated.resolution
            );
            return NextResponse.json({ ok: true, data: resolved });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        logger.error('Moderation operation failed', { requestId, error });
        return handleApiError(error, requestId);
    }
}
