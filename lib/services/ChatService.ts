/**
 * Chat Service
 * Business logic for chat operations
 *
 * SCHEMA ALIGNMENT: Uses only columns that exist in public.messages:
 *   id, room_id, sender_id, content, message_type, reply_to,
 *   metadata (JSONB), is_reported, is_deleted, moderation_status,
 *   created_at, updated_at
 *
 * Audio/file data is stored inside the `metadata` JSONB column.
 * Read receipts use the `message_statuses` table.
 */

import { supabaseAdmin } from '../supabaseAdmin';
import { ChatMessage, MessageType } from '../types/domain';
import { createLogger } from '../logger/Logger';
import { ChatError, NotFoundError, ValidationError } from '../errors/AppError';
import { sendTextMessageSchema, sendAudioMessageSchema, sendFileMessageSchema } from '../schemas';

const logger = createLogger('ChatService');

export class ChatService {
    /**
     * Send a text message
     */
    async sendTextMessage(
        roomId: string,
        senderId: string,
        content: string
    ): Promise<ChatMessage> {
        try {
            logger.info('Sending text message', { roomId, senderId, contentLength: content.length });

            const validated = sendTextMessageSchema.parse({
                roomId, senderId, content, messageType: 'text'
            });

            const { data, error } = await supabaseAdmin
                .from('messages')
                .insert({
                    room_id: validated.roomId,
                    sender_id: validated.senderId,
                    content: validated.content,
                    message_type: 'text',
                    metadata: {}
                })
                .select()
                .single();

            if (error) {
                throw new ChatError('Failed to send message', { originalError: error.message });
            }
            if (!data) {
                throw new ChatError('Message was not created');
            }

            // Update room last_message_at
            await supabaseAdmin
                .from('rooms')
                .update({ last_message_at: new Date().toISOString() })
                .eq('id', validated.roomId);

            logger.info('Text message sent successfully', { messageId: data.id });
            return this.mapDatabaseMessageToMessage(data);
        } catch (error) {
            logger.error('Failed to send text message', { roomId, senderId, error });
            throw error;
        }
    }

    /**
     * Send an audio message (metadata stored in JSONB)
     */
    async sendAudioMessage(
        roomId: string,
        senderId: string,
        audioUrl: string,
        audioDuration: number
    ): Promise<ChatMessage> {
        try {
            logger.info('Sending audio message', { roomId, senderId, audioDuration });

            const validated = sendAudioMessageSchema.parse({
                roomId, senderId, audioUrl, audioDuration, messageType: 'audio'
            });

            const { data, error } = await supabaseAdmin
                .from('messages')
                .insert({
                    room_id: validated.roomId,
                    sender_id: validated.senderId,
                    content: '[Audio Message]',
                    message_type: 'audio',
                    metadata: {
                        audioUrl: validated.audioUrl,
                        audioDuration: validated.audioDuration
                    }
                })
                .select()
                .single();

            if (error) {
                throw new ChatError('Failed to send audio message', { originalError: error.message });
            }
            if (!data) {
                throw new ChatError('Audio message was not created');
            }

            await supabaseAdmin
                .from('rooms')
                .update({ last_message_at: new Date().toISOString() })
                .eq('id', validated.roomId);

            logger.info('Audio message sent successfully', { messageId: data.id });
            return this.mapDatabaseMessageToMessage(data);
        } catch (error) {
            logger.error('Failed to send audio message', { roomId, senderId, error });
            throw error;
        }
    }

    /**
     * Send a file message (metadata stored in JSONB)
     */
    async sendFileMessage(
        roomId: string,
        senderId: string,
        fileUrl: string,
        fileName: string,
        fileSize: number,
        fileMimeType: string
    ): Promise<ChatMessage> {
        try {
            logger.info('Sending file message', { roomId, senderId, fileName, fileSize });

            const validated = sendFileMessageSchema.parse({
                roomId, senderId, fileUrl, fileName, fileSize, fileMimeType, messageType: 'file'
            });

            const { data, error } = await supabaseAdmin
                .from('messages')
                .insert({
                    room_id: validated.roomId,
                    sender_id: validated.senderId,
                    content: validated.fileName,
                    message_type: 'file',
                    metadata: {
                        fileUrl: validated.fileUrl,
                        fileName: validated.fileName,
                        fileSize: validated.fileSize,
                        fileMimeType: validated.fileMimeType
                    }
                })
                .select()
                .single();

            if (error) {
                throw new ChatError('Failed to send file message', { originalError: error.message });
            }
            if (!data) {
                throw new ChatError('File message was not created');
            }

            await supabaseAdmin
                .from('rooms')
                .update({ last_message_at: new Date().toISOString() })
                .eq('id', validated.roomId);

            logger.info('File message sent successfully', { messageId: data.id });
            return this.mapDatabaseMessageToMessage(data);
        } catch (error) {
            logger.error('Failed to send file message', { roomId, senderId, error });
            throw error;
        }
    }

    /**
     * Fetch messages from a room
     */
    async fetchMessages(roomId: string, limit: number = 50, offset: number = 0): Promise<ChatMessage[]> {
        try {
            logger.info('Fetching messages', { roomId, limit, offset });

            const { data, error } = await supabaseAdmin
                .from('messages')
                .select('*')
                .eq('room_id', roomId)
                .eq('is_deleted', false)
                .order('created_at', { ascending: true })
                .range(offset, offset + limit - 1);

            if (error) {
                throw new ChatError('Failed to fetch messages', { originalError: error.message });
            }

            return (data || []).map(msg => this.mapDatabaseMessageToMessage(msg));
        } catch (error) {
            logger.error('Failed to fetch messages', { roomId, error });
            throw error;
        }
    }

    /**
     * Mark message as read — uses the message_statuses table
     */
    async markMessageAsRead(messageId: string, userId: string): Promise<void> {
        try {
            logger.info('Marking message as read', { messageId, userId });

            const { error } = await supabaseAdmin
                .from('message_statuses')
                .upsert({
                    message_id: parseInt(messageId.replace('msg_', ''), 10),
                    user_id: userId,
                    status: 'read',
                    created_at: new Date().toISOString()
                }, { onConflict: 'message_id,user_id,status' });

            if (error) {
                logger.warn('Failed to mark message as read', { messageId, error: error.message });
            }

            logger.info('Message marked as read', { messageId });
        } catch (error) {
            logger.error('Failed to mark message as read', { messageId, error });
        }
    }

    /**
     * Soft-delete a message (sets is_deleted = true)
     */
    async deleteMessage(messageId: string, userId: string): Promise<void> {
        try {
            logger.info('Deleting message', { messageId, userId });

            const numericId = parseInt(messageId.replace('msg_', ''), 10);

            // Verify ownership
            const { data: message, error: fetchError } = await supabaseAdmin
                .from('messages')
                .select('sender_id')
                .eq('id', numericId)
                .single();

            if (fetchError || !message) {
                throw new NotFoundError('Message');
            }

            if (message.sender_id !== userId) {
                throw new ValidationError('You can only delete your own messages');
            }

            // Soft-delete
            const { error } = await supabaseAdmin
                .from('messages')
                .update({ is_deleted: true, updated_at: new Date().toISOString() })
                .eq('id', numericId);

            if (error) {
                throw new ChatError('Failed to delete message', { originalError: error.message });
            }

            logger.info('Message soft-deleted successfully', { messageId });
        } catch (error) {
            logger.error('Failed to delete message', { messageId, error });
            throw error;
        }
    }

    /**
     * Map database message to domain message.
     * Audio/file fields are read from the metadata JSONB column.
     */
    private mapDatabaseMessageToMessage(dbMessage: any): ChatMessage {
        const meta = dbMessage.metadata || {};
        return {
            id: `msg_${dbMessage.id}`,
            roomId: dbMessage.room_id,
            senderId: dbMessage.sender_id,
            content: dbMessage.content,
            messageType: dbMessage.message_type as MessageType,
            status: dbMessage.moderation_status === 'clean' ? 'sent' : dbMessage.moderation_status,
            readAt: null,
            createdAt: dbMessage.created_at,
            updatedAt: dbMessage.updated_at,
            metadata: {
                fileName: meta.fileName,
                fileSize: meta.fileSize,
                fileMimeType: meta.fileMimeType,
                fileUrl: meta.fileUrl,
                audioDuration: meta.audioDuration,
                audioUrl: meta.audioUrl
            }
        };
    }
}

export const chatService = new ChatService();
