/**
 * Typing Service
 * Manages typing indicators
 *
 * SCHEMA NOTE: The RPCs 'set_typing' and 'get_typing_users' do not exist in the
 * database. Typing indicators should use Supabase Realtime broadcast on the client-side.
 * This service now provides a no-op server implementation for API compatibility.
 */

import { createLogger } from '../logger/Logger';

const logger = createLogger('TypingService');

export interface TypingUser {
    userId: string;
    displayName: string | null;
}

export class TypingService {
    /**
     * Set typing status — no-op on server.
     * Typing indicators should be handled via Supabase Realtime broadcast on the client.
     */
    async setTyping(roomId: string, userId: string, isTyping: boolean): Promise<void> {
        // No-op: typing is handled client-side via Supabase Realtime broadcast
        logger.info('Typing status (client-side only)', { roomId, userId, isTyping });
    }

    /**
     * Get typing users — returns empty (handled client-side)
     */
    // eslint-disable-next-line no-unused-vars
    async getTypingUsers(_roomId: string): Promise<TypingUser[]> {
        return [];
    }

    /**
     * Clear typing status
     */
    async clearTyping(roomId: string, userId: string): Promise<void> {
        await this.setTyping(roomId, userId, false);
    }
}

export const typingService = new TypingService();
