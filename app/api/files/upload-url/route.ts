/**
 * POST /api/files/upload-url
 * Generate signed upload URL for files
 */

import { NextRequest, NextResponse } from 'next/server';
import { fileUploadService } from '../../../../lib/services/FileUploadService';
import { handleApiError, generateRequestId } from '../../../../lib/middleware/errorHandler';
import { logger } from '../../../../lib/logger/Logger';
import { ValidationError } from '../../../../lib/errors/AppError';
import { z } from 'zod';

const requestSchema = z.object({
    userId: z.string().uuid(),
    fileName: z.string().min(1).max(255),
    fileMimeType: z.string(),
    fileSize: z.number().positive()
});

export async function POST(req: NextRequest) {
    const requestId = generateRequestId();

    try {
        logger.info('POST /api/files/upload-url', { requestId });

        const body = await req.json();
        const validated = requestSchema.parse(body);

        const result = await fileUploadService.generateFileUploadUrl(
            validated.userId,
            validated.fileName,
            validated.fileMimeType,
            validated.fileSize
        );

        logger.info('File upload URL generated', { requestId, fileName: validated.fileName });

        return NextResponse.json(
            {
                ok: true,
                data: result
            },
            { status: 200 }
        );
    } catch (error) {
        logger.error('Failed to generate file upload URL', { requestId, error });
        return handleApiError(error, requestId);
    }
}
