/**
 * Consolidated Presence API
 * GET: Get room participants or user presence
 * POST: Update user presence status
 */

import { NextRequest, NextResponse } from 'next/server';
import { presenceService } from '../../../lib/services/PresenceService';
import { createLogger } from '../../../lib/logger/Logger';
import { z } from 'zod';

const logger = createLogger('api/presence');

const presenceSchema = z.object({
    userId: z.string().min(1),
    status: z.enum(['online', 'away', 'offline'])
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, status } = presenceSchema.parse(body);

        await presenceService.updatePresence(userId, status);

        return NextResponse.json({ success: true });
    } catch (error) {
        logger.error('Failed to update presence', { error });

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request', details: error.issues },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to update presence' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const roomId = searchParams.get('roomId');
        const userId = searchParams.get('userId');

        // If roomId provided, get room participants
        if (roomId) {
            const participants = await presenceService.getRoomParticipantsWithPresence(roomId);
            return NextResponse.json({ participants });
        }

        // If userId provided, get user presence
        if (userId) {
            const presence = await presenceService.getPresence(userId);
            return NextResponse.json(presence || { userId, status: 'offline', lastSeenAt: null });
        }

        return NextResponse.json(
            { error: 'roomId or userId is required' },
            { status: 400 }
        );
    } catch (error) {
        logger.error('Failed to get presence', { error });
        return NextResponse.json(
            { error: 'Failed to get presence' },
            { status: 500 }
        );
    }
}
