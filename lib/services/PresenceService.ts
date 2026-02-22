/**
 * Presence Service
 * Manages user online/offline status using room_participants.last_seen_at
 *
 * SCHEMA NOTE: There is no 'presence_status' table or 'update_presence' RPC.
 * We use the existing room_participants.last_seen_at column and profiles table.
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

const ONLINE_THRESHOLD_MS = 2 * 60 * 1000;   // 2 minutes
const AWAY_THRESHOLD_MS = 5 * 60 * 1000;      // 5 minutes

/**
 * Derive presence status from last_seen_at timestamp
 */
function deriveStatus(lastSeenAt: string | null): PresenceStatusType {
    if (!lastSeenAt) return 'offline';
    const diff = Date.now() - new Date(lastSeenAt).getTime();
    if (diff < ONLINE_THRESHOLD_MS) return 'online';
    if (diff < AWAY_THRESHOLD_MS) return 'away';
    return 'offline';
}

export class PresenceService {
    /**
     * Update user presence by touching last_seen_at on their room_participants rows
     */
    // eslint-disable-next-line no-unused-vars
    async updatePresence(userId: string, _status: PresenceStatusType): Promise<void> {
        try {
            logger.info('Updating presence', { userId });

            // Touch last_seen_at on all rooms the user is in
            const { error } = await supabaseAdmin
                .from('room_participants')
                .update({ last_seen_at: new Date().toISOString() })
                .eq('user_id', userId);

            if (error) {
                logger.warn('Failed to update presence', { userId, error: error.message });
            }
        } catch (error) {
            logger.error('Failed to update presence', { userId, error });
        }
    }

    /**
     * Get presence for a user (derived from most recent room participation)
     */
    async getPresence(userId: string): Promise<UserPresence | null> {
        try {
            const { data, error } = await supabaseAdmin
                .from('room_participants')
                .select('last_seen_at')
                .eq('user_id', userId)
                .order('last_seen_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error || !data) {
                return null;
            }

            return {
                userId,
                status: deriveStatus(data.last_seen_at),
                lastSeenAt: new Date(data.last_seen_at)
            };
        } catch (error) {
            logger.error('Failed to get presence', { userId, error });
            return null;
        }
    }

    /**
     * Get all participants in a room with their derived presence status
     */
    async getRoomParticipantsWithPresence(roomId: string): Promise<RoomParticipantWithPresence[]> {
        try {
            const { data, error } = await supabaseAdmin
                .from('room_participants')
                .select(`
                    user_id,
                    joined_at,
                    last_seen_at,
                    profiles!inner ( display_name, ink_id )
                `)
                .eq('room_id', roomId);

            if (error) {
                logger.error('Failed to get room participants with presence', { roomId, error });
                return [];
            }

            return (data || []).map((p: any) => ({
                userId: p.user_id,
                displayName: p.profiles?.display_name ?? null,
                inkId: p.profiles?.ink_id ?? '',
                status: deriveStatus(p.last_seen_at),
                lastSeenAt: new Date(p.last_seen_at),
                joinedAt: new Date(p.joined_at)
            }));
        } catch (error) {
            logger.error('Failed to get room participants with presence', { roomId, error });
            return [];
        }
    }

    async goOffline(userId: string): Promise<void> {
        await this.updatePresence(userId, 'offline');
    }

    async goOnline(userId: string): Promise<void> {
        await this.updatePresence(userId, 'online');
    }

    async goAway(userId: string): Promise<void> {
        await this.updatePresence(userId, 'away');
    }

    /**
     * No-op — stale presence is derived from timestamps, no cleanup needed
     */
    async cleanupStalePresence(): Promise<number> {
        return 0;
    }
}

export const presenceService = new PresenceService();
