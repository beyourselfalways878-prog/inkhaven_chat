/**
 * Presence Service
 * Manages user online/offline status using Supabase database
 */

import { supabaseAdmin } from '../supabaseAdmin';
import { createLogger } from '../logger/Logger';


const logger = createLogger('PresenceService');

export type PresenceStatusType = 'online' | 'away' | 'offline';

export interface UserPresence {
    userId: string;
    status: PresenceStatusType;
    lastSeenAt: Date;
}

export interface RoomParticipantWithPresence {
    userId: string;
    displayName: string | null;
    inkId: string;
    status: PresenceStatusType;
    lastSeenAt: Date;
    joinedAt: Date;
}

export class PresenceService {
    /**
     * Update user presence status
     */
    async updatePresence(userId: string, status: PresenceStatusType): Promise<void> {
        try {
            logger.info('Updating presence', { userId, status });

            // Use the database RPC for atomic update
            const { error } = await supabaseAdmin.rpc('update_presence', {
                p_user_id: userId,
                p_status: status
            });

            if (error) {
                logger.error('Failed to update presence via RPC', { userId, error });
                throw error;
            }

            logger.info('Presence updated', { userId, status });
        } catch (error) {
            logger.error('Failed to update presence', { userId, error });
            throw error;
        }
    }

    /**
     * Get presence for a user
     */
    async getPresence(userId: string): Promise<UserPresence | null> {
        try {
            const { data, error } = await supabaseAdmin
                .from('presence_status')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error || !data) {
                return null;
            }

            return {
                userId: data.user_id,
                status: data.status as PresenceStatusType,
                lastSeenAt: new Date(data.last_seen_at)
            };
        } catch (error) {
            logger.error('Failed to get presence', { userId, error });
            return null;
        }
    }

    /**
     * Get all participants in a room with their presence status
     */
    async getRoomParticipantsWithPresence(roomId: string): Promise<RoomParticipantWithPresence[]> {
        try {
            const { data, error } = await supabaseAdmin.rpc('get_room_participants_with_presence', {
                p_room_id: roomId
            });

            if (error) {
                logger.error('Failed to get room participants with presence', { roomId, error });
                return [];
            }

            return (data || []).map((p: any) => ({
                userId: p.user_id,
                displayName: p.display_name,
                inkId: p.ink_id,
                status: p.status as PresenceStatusType,
                lastSeenAt: new Date(p.last_seen_at),
                joinedAt: new Date(p.joined_at)
            }));
        } catch (error) {
            logger.error('Failed to get room participants with presence', { roomId, error });
            return [];
        }
    }

    /**
     * Mark user as offline
     */
    async goOffline(userId: string): Promise<void> {
        await this.updatePresence(userId, 'offline');
    }

    /**
     * Mark user as online
     */
    async goOnline(userId: string): Promise<void> {
        await this.updatePresence(userId, 'online');
    }

    /**
     * Mark user as away
     */
    async goAway(userId: string): Promise<void> {
        await this.updatePresence(userId, 'away');
    }

    /**
     * Cleanup stale presence (users who haven't updated in 5 minutes)
     */
    async cleanupStalePresence(): Promise<number> {
        try {
            const { data, error } = await supabaseAdmin
                .from('presence_status')
                .update({ status: 'offline' })
                .lt('updated_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
                .neq('status', 'offline')
                .select();

            if (error) {
                logger.error('Failed to cleanup stale presence', { error });
                return 0;
            }

            const count = data?.length || 0;
            if (count > 0) {
                logger.info('Cleaned up stale presence', { count });
            }
            return count;
        } catch (error) {
            logger.error('Failed to cleanup stale presence', { error });
            return 0;
        }
    }
}

export const presenceService = new PresenceService();
