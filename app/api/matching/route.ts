/**
 * Consolidated Matching API
 * POST: Enqueue for matching or find a match (action-based)
 */

import { NextRequest, NextResponse } from 'next/server';
import { matchingService } from '../../../lib/services/MatchingService';
import { handleApiError, generateRequestId } from '../../../lib/middleware/errorHandler';
import { findMatchSchema } from '../../../lib/schemas';
import { logger } from '../../../lib/logger/Logger';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { z } from 'zod';
import { getAuthenticatedUser } from '../../../lib/auth';
import { rateLimit } from '../../../lib/rateLimit';
import { AppError } from '../../../lib/errors/AppError';



const enqueueSchema = z.object({
    userId: z.string().min(1),
    mode: z.enum(['casual', 'deep', 'support']).optional().default('casual'),
    mood: z.enum(['chill', 'deep', 'fun', 'vent', 'curious']).optional()
});

export async function POST(req: NextRequest) {
    const requestId = generateRequestId();

    try {
        const body = await req.json();
        const action = body.action || 'enqueue';

        logger.info(`POST /api/matching`, { action, requestId });

        // Rate limiting
        const ip = req.headers.get('x-forwarded-for') ?? 'local';
        const limit = await rateLimit(`matching:${ip}`, 20, 60);
        if (!limit.allowed) {
            return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
        }

        if (action === 'enqueue') {
            const user = await getAuthenticatedUser(req);
            const validated = enqueueSchema.parse(body);
            const { userId, mode, mood } = validated;

            if (userId !== user.id) {
                throw new AppError('FORBIDDEN', 'You can only enqueue yourself', 403);
            }

            const { error } = await supabaseAdmin
                .from('connection_queue')
                .upsert({
                    user_id: userId,
                    mode: mode ?? 'casual',
                    mood: mood ?? null,
                    waiting_since: new Date().toISOString(),
                    matched_with: null,
                    current_room_id: null
                });

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            return NextResponse.json({ ok: true });
        }

        if (action === 'find') {
            const limit = await rateLimit(`matching:find:${ip}`, 30, 60);
            if (!limit.allowed) {
                return NextResponse.json(
                    { ok: false, error: 'RATE_LIMITED', message: 'Too many requests' },
                    { status: 429 }
                );
            }

            const user = await getAuthenticatedUser(req);
            const validated = findMatchSchema.parse(body);

            if (validated.userId !== user.id) {
                throw new AppError('FORBIDDEN', 'You can only find matches for yourself', 403);
            }

            const result = await matchingService.findMatch(validated.userId, validated.mode);

            logger.info('Match finding completed', { requestId, matched: result.matched });

            return NextResponse.json({ ok: true, data: result });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        logger.error('Matching operation failed', { requestId, error });
        return handleApiError(error, requestId);
    }
}
