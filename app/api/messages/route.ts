/**
 * Consolidated Messages API
 * GET: Fetch messages from a room
 * POST: Send a message (text, audio, or file)
 */

import { NextRequest, NextResponse } from 'next/server';
import { chatService } from '../../../lib/services/ChatService';
import { handleApiError, generateRequestId } from '../../../lib/middleware/errorHandler';
import { sendMessageSchema, paginationSchema } from '../../../lib/schemas';
import { logger } from '../../../lib/logger/Logger';
import { ValidationError } from '../../../lib/errors/AppError';

export async function GET(req: NextRequest) {
    const requestId = generateRequestId();

    try {
        logger.info('GET /api/messages', { requestId });

        const searchParams = req.nextUrl.searchParams;
        const roomId = searchParams.get('roomId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');

        if (!roomId) {
            throw new ValidationError('roomId is required');
        }

        const pagination = paginationSchema.parse({ page, limit });
        const offset = (pagination.page - 1) * pagination.limit;
        const messages = await chatService.fetchMessages(roomId, pagination.limit, offset);

        logger.info('Messages fetched successfully', { requestId, roomId, count: messages.length });

        return NextResponse.json({
            ok: true,
            data: messages,
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                count: messages.length
            }
        });
    } catch (error) {
        logger.error('Failed to fetch messages', { requestId, error });
        return handleApiError(error, requestId);
    }
}

export async function POST(req: NextRequest) {
    const requestId = generateRequestId();

    try {
        logger.info('POST /api/messages', { requestId });

        const body = await req.json();
        const validated = sendMessageSchema.parse(body);

        let message;

        switch (validated.messageType) {
            case 'text':
                message = await chatService.sendTextMessage(
                    validated.roomId,
                    validated.senderId,
                    validated.content
                );
                break;

            case 'audio':
                message = await chatService.sendAudioMessage(
                    validated.roomId,
                    validated.senderId,
                    validated.audioUrl,
                    validated.audioDuration
                );
                break;

            case 'file':
                message = await chatService.sendFileMessage(
                    validated.roomId,
                    validated.senderId,
                    validated.fileUrl,
                    validated.fileName,
                    validated.fileSize,
                    validated.fileMimeType
                );
                break;

            default:
                throw new Error('Invalid message type');
        }

        logger.info('Message sent successfully', { requestId, messageId: message.id });

        return NextResponse.json(
            { ok: true, data: message },
            { status: 201 }
        );
    } catch (error) {
        logger.error('Failed to send message', { requestId, error });
        return handleApiError(error, requestId);
    }
}
