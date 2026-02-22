import { redis } from '../redis';
import { supabaseAdmin } from '../supabaseAdmin';
import { createLogger } from '../logger/Logger';
import { AppError } from '../errors/AppError';
import { MatchingError } from '../errors/AppError';
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';

const logger = createLogger('QuickMatchService');
const QUEUE_KEY = 'quick_match_queue';

export interface QuickMatchResult {
    matchFound: boolean;
    roomId?: string;
    status: 'waiting' | 'matched';
}

export class QuickMatchService {
    /**
     * Find a match or enqueue the user purely in memory using Redis.
     * Optionally takes an array of interests to prioritized targeted matching.
     */
    async findMatch(userId: string, interests: string[] = []): Promise<QuickMatchResult> {
        if (!redis) {
            throw new AppError('SERVICE_UNAVAILABLE', 'Matching service unavailable', 503);
        }

        const matchKey = `match:${userId}`;

        try {
            logger.info('User requesting quick match', { userId });

            // 1. Check if another user already popped us and created a room
            const pendingRoomId = await redis.get(matchKey) as string | null;
            if (pendingRoomId) {
                // We got matched! Clear our key and return the room.
                await redis.del(matchKey);
                logger.info('Found pending match from polling', { userId, roomId: pendingRoomId });
                return { matchFound: true, roomId: pendingRoomId, status: 'matched' };
            }

            // 2. Try to pop a partner from the queue
            let partnerId = null;

            // 2a. Attempt interest-based matching first
            if (interests.length > 0) {
                // Normalize and deduplicate tags
                const tags = [...new Set(interests.map(t => t.toLowerCase().trim()).filter(Boolean))];

                for (const tag of tags) {
                    const tagKey = `interest:${tag}`;
                    const potentialPartner = await redis.spop(tagKey) as string | null;
                    if (potentialPartner && potentialPartner !== userId) {
                        partnerId = potentialPartner;
                        logger.info('Found partner via interest match', { userId, partnerId, tag });
                        break;
                    } else if (potentialPartner === userId) {
                        // We popped ourselves somehow, put it back
                        await redis.sadd(tagKey, userId);
                    }
                }

                // If no partner was found via interests, add the user to these interest sets so others can find them
                if (!partnerId) {
                    const multi = redis.multi();
                    for (const tag of tags) {
                        multi.sadd(`interest:${tag}`, userId);
                    }
                    // Keep track of which tags the user is in so we can clean them up on 'leave'
                    if (tags.length > 0) {
                        multi.sadd(`userTags:${userId}`, ...(tags as [string, ...string[]]));
                    }
                    await multi.exec();
                    logger.info('User added to interest matching pools', { userId, tags });

                    // We don't immediately add them to the global queue yet if they specified interests.
                    // The frontend will re-poll without interests as a 'fallback' later if needed.
                    return {
                        matchFound: false,
                        status: 'waiting'
                    };
                }
            }

            // 2b. If no interests provided, try the global quick match queue
            if (!partnerId) {
                const popped = await redis.rpop(QUEUE_KEY) as string | null;
                if (popped && popped !== userId) {
                    partnerId = popped;
                    logger.info('Partner popped from global queue', { userId, partnerId });
                } else if (popped === userId) {
                    logger.info('Popped self from queue, ignoring', { userId });
                }
            }

            if (partnerId) {
                // We have a match! Generate an eye-catchy string for the WebRTC room.
                const roomId = uniqueNamesGenerator({
                    dictionaries: [adjectives, colors, animals],
                    separator: '-',
                    length: 3
                });

                // Notify the partner by setting their match key (expires in 30 seconds)
                await redis.setex(`match:${partnerId}`, 30, roomId);

                logger.info('In-Memory Room created', { roomId, userId, partnerId });

                return {
                    matchFound: true,
                    roomId,
                    status: 'matched'
                };
            }

            if (partnerId === userId) {
                logger.info('Popped self from queue, ignoring', { userId });
            }

            // 3. No match found, enqueue self
            await redis.lpush(QUEUE_KEY, userId);
            logger.info('User enqueued in Redis', { userId });

            return {
                matchFound: false,
                status: 'waiting'
            };

        } catch (error) {
            const errMsg = error instanceof Error ? error.message : String(error);
            logger.error('Quick match failed', { userId, error: errMsg });
            throw error instanceof AppError ? error : new MatchingError(`Quick match failed: ${errMsg}`);
        }
    }

    /**
     * Remove user from queue
     */
    async leaveQueue(userId: string): Promise<void> {
        if (!redis) return;
        try {
            const multi = redis.multi();
            multi.lrem(QUEUE_KEY, 0, userId);
            multi.del(`match:${userId}`); // Also clear any pending matches

            // Cleanup interest sets
            const userTagsKey = `userTags:${userId}`;
            const tags = await redis.smembers(userTagsKey);
            if (tags && tags.length > 0) {
                for (const tag of tags) {
                    multi.srem(`interest:${tag}`, userId);
                }
                multi.del(userTagsKey);
            }

            await multi.exec();
            logger.info('User removed from all quick match queues and sets', { userId });
        } catch (error) {
            logger.error('Failed to leave queue', { userId, error });
        }
    }

    /**
     * Skip current chat and find a new match.
     */
    async skipAndRematch(userId: string, currentRoomId: string): Promise<QuickMatchResult> {
        try {
            logger.info('User skipping chat (WebRTC Flow)', { userId, currentRoomId });

            // In WebRTC, we don't need to deactivate DB participants or send system messages from the server,
            // because there is no server! The P2P connection simply closes.

            // We STILL optionally record the skip in match history for safety metrics (best effort)
            try {
                await supabaseAdmin
                    .from('match_history')
                    .insert({
                        user_id: userId,
                        partner_id: userId, // Mock partner for now
                        room_id: currentRoomId,
                        feedback: 'skipped'
                    });
            } catch {
                // ignore
            }

            // Leave current queue state just in case, then find new match
            await this.leaveQueue(userId);
            return await this.findMatch(userId);
        } catch (error) {
            const errMsg = error instanceof Error ? error.message : String(error);
            logger.error('Skip and rematch failed', { userId, error: errMsg });
            throw error instanceof AppError ? error : new MatchingError(`Skip and rematch failed: ${errMsg}`);
        }
    }
}

export const quickMatchService = new QuickMatchService();
