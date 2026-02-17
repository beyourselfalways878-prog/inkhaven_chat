import { redis } from '../redis';
import { supabaseAdmin } from '../supabaseAdmin';
import { createLogger } from '../logger/Logger';
import { AppError } from '../errors/AppError';
import { MatchingError } from '../errors/AppError';

const logger = createLogger('QuickMatchService');
const QUEUE_KEY = 'quick_match_queue';

export interface QuickMatchResult {
    matchFound: boolean;
    roomId?: string;
    status: 'waiting' | 'matched';
}

export class QuickMatchService {
    /**
     * Find a match or enqueue the user.
     * Atomic RPOP from queue -> Match -> Create Room -> Return.
     * If queue empty -> Enqueue -> Return 'waiting'.
     */
    async findMatch(userId: string): Promise<QuickMatchResult> {
        if (!redis) {
            throw new AppError('SERVICE_UNAVAILABLE', 'Matching service unavailable', 503);
        }

        try {
            logger.info('User requesting quick match', { userId });

            // 1. Try to pop a user from the queue (FIFO - First In First Out for fairness, or LIFO if using List)
            // using RPOP implies we push to left (LPUSH).
            const partnerId = await redis.rpop(QUEUE_KEY) as string | null;
            logger.info('Queue pop result', { userId, partnerId });

            // 2. If valid partner found (and not self)
            if (partnerId && partnerId !== userId) {
                logger.info('Partner found in queue', { userId, partnerId });

                // Create Room in Postgres
                const { data: room, error: roomError } = await supabaseAdmin
                    .from('rooms')
                    .insert({ created_at: new Date().toISOString() })
                    .select()
                    .single();

                if (roomError || !room) {
                    logger.error('Failed to create room', { roomError: roomError?.message, roomErrorDetails: roomError?.details, roomErrorHint: roomError?.hint, roomErrorCode: roomError?.code });
                    // Push partner back to queue if room creation fails
                    await redis.rpush(QUEUE_KEY, partnerId);
                    throw new MatchingError(`Failed to create room: ${roomError?.message || 'unknown'}`);
                }

                logger.info('Room created', { roomId: room.id });

                // Add both to room
                const { error: partError } = await supabaseAdmin
                    .from('room_participants')
                    .insert([
                        {
                            room_id: room.id,
                            user_id: userId,
                            joined_at: new Date().toISOString(),
                            last_seen_at: new Date().toISOString()
                        },
                        {
                            room_id: room.id,
                            user_id: partnerId,
                            joined_at: new Date().toISOString(),
                            last_seen_at: new Date().toISOString()
                        }
                    ]);

                if (partError) {
                    logger.error('Failed to add participants', { partError: partError?.message, partErrorDetails: partError?.details, partErrorHint: partError?.hint, partErrorCode: partError?.code });
                    throw new MatchingError(`Failed to add participants: ${partError?.message || 'unknown'}`);
                }

                logger.info('Quick match successful', { roomId: room.id, userId, partnerId });

                return {
                    matchFound: true,
                    roomId: room.id,
                    status: 'matched'
                };
            }

            // 3. If no partner or popped self, enqueue self
            // If we popped self (unlikely but possible if re-requesting), just push back or ignore
            if (partnerId === userId) {
                logger.info('Popped self from queue, re-queuing', { userId });
            }

            // LPUSH to add to start of list (waiting line)
            await redis.lpush(QUEUE_KEY, userId);

            logger.info('User enqueued', { userId });

            return {
                matchFound: false,
                status: 'waiting'
            };

        } catch (error) {
            const errMsg = error instanceof Error ? error.message : String(error);
            logger.error('Quick match failed', { userId, error: errMsg, stack: error instanceof Error ? error.stack : undefined });
            throw error instanceof AppError ? error : new MatchingError(`Quick match failed: ${errMsg}`);
        }
    }

    /**
     * Optional: Remove user from queue if they cancel
     */
    async leaveQueue(userId: string): Promise<void> {
        if (!redis) return;
        try {
            // LREM removes elements matching value
            await redis.lrem(QUEUE_KEY, 0, userId);
            logger.info('User removed from quick match queue', { userId });
        } catch (error) {
            logger.error('Failed to leave queue', { userId, error });
        }
    }
}

export const quickMatchService = new QuickMatchService();
