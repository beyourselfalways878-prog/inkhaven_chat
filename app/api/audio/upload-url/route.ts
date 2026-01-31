/**
 * POST /api/audio/upload-url
 * Generate signed upload URL for audio messages
 */

import { NextRequest, NextResponse } from 'next/server';
import { fileUploadService } from '../../../../lib/services/FileUploadService';
import { handleApiError, generateRequestId } from '../../../../lib/middleware/errorHandler';
import { logger } from '../../../../lib/logger/Logger';
import { z } from 'zod';

const requestSchema = z.object({
    userId: z.string().uuid(),
    audioDuration: z.number().positive().max(600),
    fileMimeType: z.string().regex(/^audio\//)
});

export async function POST(req: NextRequest) {
    const requestId = generateRequestId();

    try {
        logger.info('POST /api/audio/upload-url', { requestId });

        const body = await req.json();
        const validated = requestSchema.parse(body);

        const result = await fileUploadService.generateAudioUploadUrl(
            validated.userId,
            validated.audioDuration,
            validated.fileMimeType
        );

        logger.info('Audio upload URL generated', { requestId, duration: validated.audioDuration });

        return NextResponse.json(
            {
                ok: true,
                data: result
            },
            { status: 200 }
        );
    } catch (error) {
        logger.error('Failed to generate audio upload URL', { requestId, error });
        return handleApiError(error, requestId);
    }
}
