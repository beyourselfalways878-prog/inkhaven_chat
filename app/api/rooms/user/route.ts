import { NextRequest, NextResponse } from 'next/server';
import { roomService } from '../../../../lib/services/RoomService';
import { handleApiError, generateRequestId } from '../../../../lib/middleware/errorHandler';
import { getAuthenticatedUser } from '../../../../lib/auth';
import { logger } from '../../../../lib/logger/Logger';

export async function GET(req: NextRequest) {
    const requestId = generateRequestId();

    try {
        const user = await getAuthenticatedUser(req);
        logger.info('GET /api/rooms/user', { requestId, userId: user.id });

        const searchParams = req.nextUrl.searchParams;
        const limit = parseInt(searchParams.get('limit') || '50', 10);

        const rooms = await roomService.getUserRooms(user.id, limit);

        logger.info('User rooms fetched successfully', { requestId, count: rooms.length });

        return NextResponse.json({
            ok: true,
            data: rooms
        });
    } catch (error) {
        logger.error('Failed to fetch user rooms', { requestId, error });
        return handleApiError(error, requestId);
    }
}
