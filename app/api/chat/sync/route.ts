import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import { getAuthenticatedUser } from '../../../../lib/auth';
import { handleApiError, generateRequestId } from '../../../../lib/middleware/errorHandler';
import { createLogger } from '../../../../lib/logger/Logger';

const logger = createLogger('ChatSyncAPI');

export async function POST(req: NextRequest) {
    const requestId = generateRequestId();

    try {
        // Only authenticated users can sync chat history
        const user = await getAuthenticatedUser(req);
        logger.info('POST /api/chat/sync', { requestId, userId: user.id });

        const { roomId, messages } = await req.json();

        if (!roomId || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ ok: true, message: 'Nothing to sync' });
        }

        // Map the WebRTCMessages to our Postgres schema
        const insertPayload = messages.map((m: any) => ({
            id: m.id,
            room_id: roomId,
            sender_id: m.senderId,
            content: m.content,
            message_type: m.messageType || 'text',
            created_at: m.createdAt || new Date().toISOString(),
            // Only store basic metadata if we want, ignoring purely ephemeral UI states like `isEdited` here
        }));

        // Use UPSERT so we don't duplicate messages if we sync multiple times
        const { error } = await supabaseAdmin
            .from('messages')
            .upsert(insertPayload, { onConflict: 'id' });

        if (error) {
            logger.error('Failed to sync messages', { error: error.message, code: error.code });
            throw new Error(`Failed to sync: ${error.message}`);
        }

        return NextResponse.json({ ok: true, syncedCount: messages.length });

    } catch (error) {
        // If not authenticated, we just return 200 basically ignoring it contextually 
        // because anonymous users don't have sync enabled.
        if (error instanceof Error && error.message.includes('No auth token')) {
            return NextResponse.json({ ok: true, skipped: 'anonymous' });
        }

        const errMsg = error instanceof Error ? error.message : String(error);
        logger.error('Chat sync API failed', { requestId, error: errMsg });
        return handleApiError(error, requestId);
    }
}
