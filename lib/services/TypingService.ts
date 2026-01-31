/**
 * Typing Service
 * Manages typing indicators using database-backed state
 */

import { supabaseAdmin } from '../supabaseAdmin';
import { createLogger } from '../logger/Logger';

const logger = createLogger('TypingService');

export interface TypingUser {
    userId: string;
    displayName: string | null;
}

export class TypingService {
    /**
     * Set typing status for a user in a room
     */
    async setTyping(roomId: string, userId: string, isTyping: boolean): Promise<void> {
        try {
            const { error } = await supabaseAdmin.rpc('set_typing', {
                p_room_id: roomId,
                p_user_id: userId,
                p_is_typing: isTyping
            });

            if (error) {
                logger.warn('Failed to set typing status', { roomId, userId, error });
            }
        } catch (error) {
            logger.error('Failed to set typing status', { roomId, userId, error });
        }
    }

    /**
     * Get all users currently typing in a room
     */
    async getTypingUsers(roomId: string): Promise<TypingUser[]> {
        try {
            const { data, error } = await supabaseAdmin.rpc('get_typing_users', {
                p_room_id: roomId
            });

            if (error) {
                logger.warn('Failed to get typing users', { roomId, error });
                return [];
            }

            return (data || []).map((u: any) => ({
                userId: u.user_id,
                displayName: u.display_name
            }));
        } catch (error) {
            logger.error('Failed to get typing users', { roomId, error });
            return [];
        }
    }

    /**
     * Clear typing status for a user (when they send a message)
     */
    async clearTyping(roomId: string, userId: string): Promise<void> {
        await this.setTyping(roomId, userId, false);
    }
}

export const typingService = new TypingService();
