/**
 * Room Service
 * Business logic for chat room operations
 */

import { supabaseAdmin } from '../supabaseAdmin';
import { ChatRoom, RoomParticipant } from '../types/domain';
import { createLogger } from '../logger/Logger';
import { ChatError, NotFoundError, ValidationError } from '../errors/AppError';

const logger = createLogger('RoomService');

export class RoomService {
    /**
     * Create a new chat room
     */
    async createRoom(userId: string): Promise<ChatRoom> {
        try {
            logger.info('Creating room', { userId });

            // Create room
            const { data: room, error: roomError } = await supabaseAdmin
                .from('rooms')
                .insert({})
                .select()
                .single();

            if (roomError || !room) {
                throw new ChatError('Failed to create room');
            }

            // Add creator as participant
            const { error: participantError } = await supabaseAdmin
                .from('room_participants')
                .insert({
                    room_id: room.id,
                    user_id: userId,
                    joined_at: new Date().toISOString(),
                    last_seen_at: new Date().toISOString()
                });

            if (participantError) {
                logger.warn('Failed to add participant', { roomId: room.id, userId });
            }

            logger.info('Room created successfully', { roomId: room.id });

            return this.mapDatabaseRoomToRoom(room);
        } catch (error) {
            logger.error('Failed to create room', { userId, error });
            throw error;
        }
    }

    /**
     * Get room details
     */
    async getRoom(roomId: string): Promise<ChatRoom> {
        try {
            logger.info('Fetching room', { roomId });

            const { data, error } = await supabaseAdmin
                .from('rooms')
                .select('*')
                .eq('id', roomId)
                .single();

            if (error || !data) {
                throw new NotFoundError('Room');
            }

            return this.mapDatabaseRoomToRoom(data);
        } catch (error) {
            logger.error('Failed to fetch room', { roomId, error });
            throw error;
        }
    }

    /**
     * Join a room
     */
    async joinRoom(roomId: string, userId: string): Promise<void> {
        try {
            logger.info('Joining room', { roomId, userId });

            // Verify room exists
            const { data: room, error: roomError } = await supabaseAdmin
                .from('rooms')
                .select('id')
                .eq('id', roomId)
                .single();

            if (roomError || !room) {
                throw new NotFoundError('Room');
            }

            // Add participant
            const { error } = await supabaseAdmin
                .from('room_participants')
                .upsert({
                    room_id: roomId,
                    user_id: userId,
                    joined_at: new Date().toISOString(),
                    last_seen_at: new Date().toISOString()
                });

            if (error) {
                throw new ChatError('Failed to join room', { originalError: error.message });
            }

            logger.info('User joined room', { roomId, userId });
        } catch (error) {
            logger.error('Failed to join room', { roomId, userId, error });
            throw error;
        }
    }

    /**
     * Leave a room
     */
    async leaveRoom(roomId: string, userId: string): Promise<void> {
        try {
            logger.info('Leaving room', { roomId, userId });

            const { error } = await supabaseAdmin
                .from('room_participants')
                .delete()
                .eq('room_id', roomId)
                .eq('user_id', userId);

            if (error) {
                throw new ChatError('Failed to leave room', { originalError: error.message });
            }

            logger.info('User left room', { roomId, userId });
        } catch (error) {
            logger.error('Failed to leave room', { roomId, userId, error });
            throw error;
        }
    }

    /**
     * Get room participants
     */
    async getRoomParticipants(roomId: string): Promise<RoomParticipant[]> {
        try {
            logger.info('Fetching room participants', { roomId });

            const { data, error } = await supabaseAdmin
                .from('room_participants')
                .select('*')
                .eq('room_id', roomId);

            if (error) {
                throw new ChatError('Failed to fetch participants', { originalError: error.message });
            }

            return (data || []).map(p => ({
                roomId: p.room_id,
                userId: p.user_id,
                joinedAt: p.joined_at,
                lastSeenAt: p.last_seen_at
            }));
        } catch (error) {
            logger.error('Failed to fetch room participants', { roomId, error });
            throw error;
        }
    }

    /**
     * Update last seen timestamp
     */
    async updateLastSeen(roomId: string, userId: string): Promise<void> {
        try {
            const { error } = await supabaseAdmin
                .from('room_participants')
                .update({ last_seen_at: new Date().toISOString() })
                .eq('room_id', roomId)
                .eq('user_id', userId);

            if (error) {
                logger.warn('Failed to update last seen', { roomId, userId });
            }
        } catch (error) {
            logger.error('Failed to update last seen', { roomId, userId, error });
        }
    }

    /**
     * Check if user is in room
     */
    async isUserInRoom(roomId: string, userId: string): Promise<boolean> {
        try {
            const { data, error } = await supabaseAdmin
                .from('room_participants')
                .select('id')
                .eq('room_id', roomId)
                .eq('user_id', userId)
                .single();

            return !error && !!data;
        } catch (error) {
            logger.error('Failed to check room membership', { roomId, userId, error });
            return false;
        }
    }

    /**
     * Get user's rooms
     */
    async getUserRooms(userId: string, limit: number = 50): Promise<ChatRoom[]> {
        try {
            logger.info('Fetching user rooms', { userId, limit });

            const { data, error } = await supabaseAdmin
                .from('room_participants')
                .select('room_id')
                .eq('user_id', userId)
                .limit(limit);

            if (error) {
                throw new ChatError('Failed to fetch user rooms', { originalError: error.message });
            }

            if (!data || data.length === 0) {
                return [];
            }

            const roomIds = data.map(p => p.room_id);

            const { data: rooms, error: roomsError } = await supabaseAdmin
                .from('rooms')
                .select('*')
                .in('id', roomIds)
                .order('created_at', { ascending: false });

            if (roomsError) {
                throw new ChatError('Failed to fetch rooms', { originalError: roomsError.message });
            }

            return (rooms || []).map(room => this.mapDatabaseRoomToRoom(room));
        } catch (error) {
            logger.error('Failed to fetch user rooms', { userId, error });
            throw error;
        }
    }

    /**
     * Map database room to domain room
     */
    private mapDatabaseRoomToRoom(dbRoom: any): ChatRoom {
        return {
            id: dbRoom.id,
            participantIds: [],
            createdAt: dbRoom.created_at,
            updatedAt: dbRoom.updated_at,
            lastMessageAt: dbRoom.last_message_at
        };
    }
}

export const roomService = new RoomService();
