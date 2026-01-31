/**
 * Block Service
 * Manages user blocking functionality
 */

import { supabaseAdmin } from '../supabaseAdmin';
import { createLogger } from '../logger/Logger';
import { ValidationError } from '../errors/AppError';

const logger = createLogger('BlockService');

export interface UserBlock {
    id: string;
    blockerId: string;
    blockedId: string;
    reason?: string;
    createdAt: string;
}

export class BlockService {
    /**
     * Block a user
     */
    async blockUser(blockerId: string, blockedId: string, reason?: string): Promise<UserBlock> {
        try {
            logger.info('Blocking user', { blockerId, blockedId });

            if (blockerId === blockedId) {
                throw new ValidationError('Cannot block yourself');
            }

            const { data, error } = await supabaseAdmin
                .from('user_blocks')
                .upsert({
                    blocker_id: blockerId,
                    blocked_id: blockedId,
                    reason: reason || null,
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) {
                throw new Error(`Failed to block user: ${error.message}`);
            }

            logger.info('User blocked successfully', { blockerId, blockedId });

            return {
                id: data.id,
                blockerId: data.blocker_id,
                blockedId: data.blocked_id,
                reason: data.reason,
                createdAt: data.created_at
            };
        } catch (error) {
            logger.error('Failed to block user', { blockerId, blockedId, error });
            throw error;
        }
    }

    /**
     * Unblock a user
     */
    async unblockUser(blockerId: string, blockedId: string): Promise<void> {
        try {
            logger.info('Unblocking user', { blockerId, blockedId });

            const { error } = await supabaseAdmin
                .from('user_blocks')
                .delete()
                .eq('blocker_id', blockerId)
                .eq('blocked_id', blockedId);

            if (error) {
                throw new Error(`Failed to unblock user: ${error.message}`);
            }

            logger.info('User unblocked successfully', { blockerId, blockedId });
        } catch (error) {
            logger.error('Failed to unblock user', { blockerId, blockedId, error });
            throw error;
        }
    }

    /**
     * Check if a user is blocked (bidirectional)
     */
    async isBlocked(userId: string, targetId: string): Promise<boolean> {
        try {
            const { data } = await supabaseAdmin
                .from('user_blocks')
                .select('id')
                .or(`blocker_id.eq.${userId},blocker_id.eq.${targetId}`)
                .or(`blocked_id.eq.${userId},blocked_id.eq.${targetId}`)
                .limit(1);

            return (data && data.length > 0) || false;
        } catch (error) {
            logger.error('Failed to check block status', { userId, targetId, error });
            return false;
        }
    }

    /**
     * Get list of users blocked by a user
     */
    async getBlockedUsers(userId: string): Promise<UserBlock[]> {
        try {
            const { data, error } = await supabaseAdmin
                .from('user_blocks')
                .select('*')
                .eq('blocker_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(`Failed to get blocked users: ${error.message}`);
            }

            return (data || []).map(row => ({
                id: row.id,
                blockerId: row.blocker_id,
                blockedId: row.blocked_id,
                reason: row.reason,
                createdAt: row.created_at
            }));
        } catch (error) {
            logger.error('Failed to get blocked users', { userId, error });
            return [];
        }
    }

    /**
     * Get IDs of users to exclude from matching (blocked in either direction)
     */
    async getExcludedUserIds(userId: string): Promise<string[]> {
        try {
            const { data } = await supabaseAdmin
                .from('user_blocks')
                .select('blocker_id, blocked_id')
                .or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`);

            if (!data) return [];

            const excludedIds = new Set<string>();
            for (const row of data) {
                if (row.blocker_id !== userId) excludedIds.add(row.blocker_id);
                if (row.blocked_id !== userId) excludedIds.add(row.blocked_id);
            }

            return Array.from(excludedIds);
        } catch (error) {
            logger.error('Failed to get excluded user IDs', { userId, error });
            return [];
        }
    }
}

export const blockService = new BlockService();
