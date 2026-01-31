/**
 * Consolidated Moderation API
 * All moderation actions: check, report, ban, list reports, resolve
 */

import { NextRequest, NextResponse } from 'next/server';
import { moderationService } from '../../../lib/services/ModerationService';
import { handleApiError, generateRequestId } from '../../../lib/middleware/errorHandler';
import { checkModerationSchema, reportMessageSchema } from '../../../lib/schemas';
import { logger } from '../../../lib/logger/Logger';
import { rateLimitPersistent } from '../../../lib/rateLimitPersistent';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { z } from 'zod';

async function verifyAdminAuth(req: Request): Promise<boolean> {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) return false;

    try {
        const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(token);
        if (error || !user) return false;

        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        return profile?.is_admin === true;
    } catch {
        return false;
    }
}

const actionSchema = z.object({
    action: z.enum(['check', 'report', 'ban', 'resolve'])
}).passthrough();

const banSchema = z.object({
    userId: z.string().min(1),
    reason: z.string().max(500).optional()
});

const resolveSchema = z.object({
    reportId: z.string().min(1),
    resolution: z.enum(['dismissed', 'warned', 'banned'])
});

export async function GET(req: Request) {
    try {
        if (!(await verifyAdminAuth(req))) {
            return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
        }

        const { data, error } = await supabaseAdmin
            .from('message_reports')
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
        const { action } = actionSchema.parse(body);

        logger.info(`POST /api/moderation (action: ${action})`, { requestId });

        // Check content moderation
        if (action === 'check') {
            const limit = await rateLimitPersistent(`moderation:check:${ip}`, 60, 60);
            if (!limit.allowed) {
                return NextResponse.json({ ok: false, error: 'RATE_LIMITED' }, { status: 429 });
            }

            const validated = checkModerationSchema.parse(body);
            const mode = body.mode || 'safe'; // 'safe' or 'adult'
            const result = await moderationService.checkContent(validated.text, mode);

            logger.info('Content moderation check completed', { requestId, flagged: result.flagged });
            return NextResponse.json({ ok: true, data: result });
        }

        // Report a message
        if (action === 'report') {
            const limit = await rateLimitPersistent(`moderation:report:${ip}`, 10, 60);
            if (!limit.allowed) {
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
            const { error } = await supabaseAdmin
                .from('banned_users')
                .upsert({ user_id: validated.userId, reason: validated.reason ?? 'moderation' });

            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            return NextResponse.json({ ok: true });
        }

        // Resolve report (admin only)
        if (action === 'resolve') {
            if (!(await verifyAdminAuth(req))) {
                return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
            }

            const validated = resolveSchema.parse(body);
            const { error } = await supabaseAdmin
                .from('message_reports')
                .update({ status: validated.resolution, resolved_at: new Date().toISOString() })
                .eq('id', validated.reportId);

            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
            return NextResponse.json({ ok: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        logger.error('Moderation operation failed', { requestId, error });
        return handleApiError(error, requestId);
    }
}
