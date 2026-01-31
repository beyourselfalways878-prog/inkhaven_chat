/**
 * Consolidated Rooms API
 * POST: Create or join a room (action-based)
 */

import { NextRequest, NextResponse } from 'next/server';
import { roomService } from '../../../lib/services/RoomService';
import { handleApiError, generateRequestId } from '../../../lib/middleware/errorHandler';
import { createRoomSchema, joinRoomSchema } from '../../../lib/schemas';
import { logger } from '../../../lib/logger/Logger';
import { z } from 'zod';

const actionSchema = z.object({
    action: z.enum(['create', 'join'])
}).passthrough();

export async function POST(req: NextRequest) {
    const requestId = generateRequestId();

    try {
        const body = await req.json();
        const { action } = actionSchema.parse(body);

        logger.info(`POST /api/rooms (action: ${action})`, { requestId });

        if (action === 'create') {
            const validated = createRoomSchema.parse(body);
            const room = await roomService.createRoom(validated.userId);

            logger.info('Room created successfully', { requestId, roomId: room.id });

            return NextResponse.json(
                { ok: true, data: room },
                { status: 201 }
            );
        }

        if (action === 'join') {
            const validated = joinRoomSchema.parse(body);
            await roomService.joinRoom(validated.roomId, validated.userId);

            logger.info('User joined room successfully', { requestId, roomId: validated.roomId });

            return NextResponse.json(
                { ok: true, message: 'Successfully joined room' },
                { status: 200 }
            );
        }

        return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
        );
    } catch (error) {
        logger.error('Room operation failed', { requestId, error });
        return handleApiError(error, requestId);
    }
}
