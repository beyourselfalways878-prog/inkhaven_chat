/**
 * Ban Service
 * Manages user bans for moderation
 */

import { supabaseAdmin } from '../supabaseAdmin';
import { createLogger } from '../logger/Logger';

const logger = createLogger('BanService');

export interface UserBan {
    userId: string;
    bannedAt: Date;
    bannedUntil: Date | null;
    reason: string;
    bannedBy: string | null;
}

export class BanService {
    /**
     * Ban a user
     */
    async banUser(
        userId: string,
        reason: string,
        bannedBy: string,
        duration?: number // Hours, null = permanent
    ): Promise<UserBan> {
        try {
            logger.info('Banning user', { userId, reason, duration });

            const bannedUntil = duration
                ? new Date(Date.now() + duration * 60 * 60 * 1000).toISOString()
                : null;

            const { data, error } = await supabaseAdmin
                .from('banned_users')
                .upsert({
                    user_id: userId,
                    banned_at: new Date().toISOString(),
                    banned_until: bannedUntil,
                    reason,
                    banned_by: bannedBy
                })
                .select()
                .single();

            if (error) {
                throw new Error(`Failed to ban user: ${error.message}`);
            }

            logger.info('User banned', { userId, bannedUntil });

            return {
                userId: data.user_id,
                bannedAt: new Date(data.banned_at),
                bannedUntil: data.banned_until ? new Date(data.banned_until) : null,
                reason: data.reason,
                bannedBy: data.banned_by
            };
        } catch (error) {
            logger.error('Failed to ban user', { userId, error });
            throw error;
        }
    }

    /**
     * Unban a user
     */
    async unbanUser(userId: string): Promise<void> {
        try {
            logger.info('Unbanning user', { userId });

            const { error } = await supabaseAdmin
                .from('banned_users')
                .delete()
                .eq('user_id', userId);

            if (error) {
                throw new Error(`Failed to unban user: ${error.message}`);
            }

            logger.info('User unbanned', { userId });
        } catch (error) {
            logger.error('Failed to unban user', { userId, error });
            throw error;
        }
    }

    /**
     * Check if a user is banned
     */
    async isUserBanned(userId: string): Promise<boolean> {
        try {
            const { data, error } = await supabaseAdmin
                .from('banned_users')
                .select('user_id, banned_until')
                .eq('user_id', userId)
                .maybeSingle();

            if (error || !data) {
                // Table may not exist, or user not banned
                return false;
            }

            // Check if ban has expired
            if (data.banned_until) {
                const bannedUntil = new Date(data.banned_until);
                if (bannedUntil < new Date()) {
                    await supabaseAdmin
                        .from('banned_users')
                        .delete()
                        .eq('user_id', userId);
                    return false;
                }
            }

            return true;
        } catch (error) {
            logger.error('Failed to check ban status', { userId, error });
            return false;
        }
    }

    /**
     * Get ban info for a user
     */
    async getBanInfo(userId: string): Promise<UserBan | null> {
        try {
            const { data, error } = await supabaseAdmin
                .from('banned_users')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error || !data) {
                return null;
            }

            return {
                userId: data.user_id,
                bannedAt: new Date(data.banned_at),
                bannedUntil: data.banned_until ? new Date(data.banned_until) : null,
                reason: data.reason,
                bannedBy: data.banned_by
            };
        } catch (error) {
            logger.error('Failed to get ban info', { userId, error });
            return null;
        }
    }

    /**
     * Get all active bans
     */
    async getActiveBans(): Promise<UserBan[]> {
        try {
            const { data, error } = await supabaseAdmin
                .from('banned_users')
                .select('*')
                .or(`banned_until.is.null,banned_until.gt.${new Date().toISOString()}`);

            if (error) {
                throw new Error(`Failed to get active bans: ${error.message}`);
            }

            return (data || []).map(ban => ({
                userId: ban.user_id,
                bannedAt: new Date(ban.banned_at),
                bannedUntil: ban.banned_until ? new Date(ban.banned_until) : null,
                reason: ban.reason,
                bannedBy: ban.banned_by
            }));
        } catch (error) {
            logger.error('Failed to get active bans', { error });
            return [];
        }
    }
}

export const banService = new BanService();
