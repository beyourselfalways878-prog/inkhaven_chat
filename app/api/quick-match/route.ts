import { NextRequest, NextResponse } from 'next/server';
import { quickMatchService } from '../../../lib/services/QuickMatchService';
import { getAuthenticatedUser } from '../../../lib/auth';
import { handleApiError, generateRequestId } from '../../../lib/middleware/errorHandler';
import { createLogger } from '../../../lib/logger/Logger';

const logger = createLogger('QuickMatchAPI');

export async function POST(req: NextRequest) {
    const requestId = generateRequestId();

    try {
        const user = await getAuthenticatedUser(req);
        logger.info('POST /api/quick-match', { requestId, userId: user.id });

        // No body parsing needed for simple "find me a match"
        // But we could accept an 'action' if we want to support 'leave' later
        const body = await req.json().catch(() => ({})); // Handle empty body safely

        if (body.action === 'leave') {
            await quickMatchService.leaveQueue(user.id);
            return NextResponse.json({ ok: true });
        }

        const result = await quickMatchService.findMatch(user.id);

        return NextResponse.json({
            ok: true,
            data: result
        });

    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        const errStack = error instanceof Error ? error.stack : undefined;
        logger.error('Quick match API failed', { requestId, error: errMsg, stack: errStack });
        return handleApiError(error, requestId);
    }
}
