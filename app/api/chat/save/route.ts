import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';
import { getAuthenticatedUser } from '../../../../lib/auth';
import { handleApiError, generateRequestId } from '../../../../lib/middleware/errorHandler';
import { createLogger } from '../../../../lib/logger/Logger';

const logger = createLogger('ChatSaveAPI');

export async function POST(req: NextRequest) {
    const requestId = generateRequestId();

    try {
        const user = await getAuthenticatedUser(req);
        logger.info('POST /api/chat/save', { requestId, userId: user.id });

        if (user.isAnonymous) {
            return NextResponse.json({ ok: false, message: 'Anonymous users cannot save chats or form friendships.' }, { status: 403 });
        }

        const { roomId, partnerId } = await req.json();

        if (!roomId || !partnerId) {
            return NextResponse.json({ ok: false, message: 'Missing room or partner information.' }, { status: 400 });
        }

        // 1. Insert save intent into `chat_saves`
        const { error: saveError } = await supabaseAdmin
            .from('chat_saves')
            .upsert({ room_id: roomId, user_id: user.id }, { onConflict: 'room_id, user_id' });

        if (saveError) {
            logger.error('Failed to log save intent', { error: saveError });
            throw new Error('Could not process save request at this time.');
        }

        // 2. Check if the partner has also saved this room
        const { data: partnerSave, error: partnerSaveError } = await supabaseAdmin
            .from('chat_saves')
            .select('saved_at')
            .eq('room_id', roomId)
            .eq('user_id', partnerId)
            .maybeSingle();

        if (partnerSaveError) {
            logger.warn('Error checking partner save status', { partnerSaveError });
        }

        if (partnerSave) {
            // MUTUAL SAVE DETECTED!
            logger.info('Mutual save detected, forming friendship.', { roomId, user1: user.id, user2: partnerId });

            // Ensure order for friendship uniqueness
            const [u1, u2] = user.id < partnerId ? [user.id, partnerId] : [partnerId, user.id];

            const { error: friendshipError } = await supabaseAdmin
                .from('friendships')
                .upsert({ user1_id: u1, user2_id: u2, status: 'active' }, { onConflict: 'user1_id, user2_id' });

            if (friendshipError) {
                logger.error('Error creating friendship', { friendshipError });
                // We don't throw here, we still want to trigger the reveal. Let it be eventually consistent if needed.
            }

            // Broadcast REVEAL event over Supabase Realtime so both clients instantly drop their masks
            await supabaseAdmin.channel(`webrtc_${roomId}`).send({
                type: 'broadcast',
                event: 'signal',
                payload: {
                    type: 'REVEAL',
                    senderId: 'SYSTEM',
                    data: { message: "Mutual save completed. Anonymity lifted." }
                }
            });

            return NextResponse.json({ ok: true, status: 'mutual', message: 'Chat mutually saved and identities revealed.' });
        }

        // Singular Save scenario (waiting for partner)
        return NextResponse.json({ ok: true, status: 'pending', message: 'Save intent registered. Waiting for partner.' });

    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        logger.error('Chat save API failed', { requestId, error: errMsg });
        return handleApiError(error, requestId);
    }
}
