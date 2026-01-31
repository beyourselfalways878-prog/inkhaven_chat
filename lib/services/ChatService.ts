/**
 * Chat Service
 * Business logic for chat operations
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

            // Validate input
            const validated = sendTextMessageSchema.parse({
                roomId,
                senderId,
                content,
                messageType: 'text'
            });

            // Insert message
            const { data, error } = await supabaseAdmin
                .from('messages')
                .insert({
                    room_id: validated.roomId,
                    sender_id: validated.senderId,
                    content: validated.content,
                    message_type: 'text',
                    status: 'sent'
                })
                .select()
                .single();

            if (error) {
                throw new ChatError('Failed to send message', { originalError: error.message });
            }

            if (!data) {
                throw new ChatError('Message was not created');
            }

            logger.info('Text message sent successfully', { messageId: data.id });

            return this.mapDatabaseMessageToMessage(data);
        } catch (error) {
            logger.error('Failed to send text message', { roomId, senderId, error });
            throw error;
        }
    }

    /**
     * Send an audio message
     */
    async sendAudioMessage(
        roomId: string,
        senderId: string,
        audioUrl: string,
        audioDuration: number
    ): Promise<ChatMessage> {
        try {
            logger.info('Sending audio message', { roomId, senderId, audioDuration });

            // Validate input
            const validated = sendAudioMessageSchema.parse({
                roomId,
                senderId,
                audioUrl,
                audioDuration,
                messageType: 'audio'
            });

            // Insert message
            const { data, error } = await supabaseAdmin
                .from('messages')
                .insert({
                    room_id: validated.roomId,
                    sender_id: validated.senderId,
                    content: validated.audioUrl,
                    message_type: 'audio',
                    audio_url: validated.audioUrl,
                    audio_duration: validated.audioDuration,
                    status: 'sent'
                })
                .select()
                .single();

            if (error) {
                throw new ChatError('Failed to send audio message', { originalError: error.message });
            }

            if (!data) {
                throw new ChatError('Audio message was not created');
            }

            logger.info('Audio message sent successfully', { messageId: data.id });

            return this.mapDatabaseMessageToMessage(data);
        } catch (error) {
            logger.error('Failed to send audio message', { roomId, senderId, error });
            throw error;
        }
    }

    /**
     * Send a file message
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

            // Validate input
            const validated = sendFileMessageSchema.parse({
                roomId,
                senderId,
                fileUrl,
                fileName,
                fileSize,
                fileMimeType,
                messageType: 'file'
            });

            // Insert message
            const { data, error } = await supabaseAdmin
                .from('messages')
                .insert({
                    room_id: validated.roomId,
                    sender_id: validated.senderId,
                    content: validated.fileName,
                    message_type: 'file',
                    file_url: validated.fileUrl,
                    file_name: validated.fileName,
                    file_size: validated.fileSize,
                    file_mime_type: validated.fileMimeType,
                    status: 'sent'
                })
                .select()
                .single();

            if (error) {
                throw new ChatError('Failed to send file message', { originalError: error.message });
            }

            if (!data) {
                throw new ChatError('File message was not created');
            }

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
     * Mark message as read
     */
    async markMessageAsRead(messageId: string, userId: string): Promise<void> {
        try {
            logger.info('Marking message as read', { messageId, userId });

            const { error } = await supabaseAdmin
                .from('messages')
                .update({ status: 'read', read_at: new Date().toISOString() })
                .eq('id', messageId);

            if (error) {
                throw new ChatError('Failed to mark message as read', { originalError: error.message });
            }

            logger.info('Message marked as read', { messageId });
        } catch (error) {
            logger.error('Failed to mark message as read', { messageId, error });
            throw error;
        }
    }

    /**
     * Delete a message
     */
    async deleteMessage(messageId: string, userId: string): Promise<void> {
        try {
            logger.info('Deleting message', { messageId, userId });

            // Verify ownership
            const { data: message, error: fetchError } = await supabaseAdmin
                .from('messages')
                .select('sender_id')
                .eq('id', messageId)
                .single();

            if (fetchError || !message) {
                throw new NotFoundError('Message');
            }

            if (message.sender_id !== userId) {
                throw new ValidationError('You can only delete your own messages');
            }

            // Delete message
            const { error } = await supabaseAdmin
                .from('messages')
                .delete()
                .eq('id', messageId);

            if (error) {
                throw new ChatError('Failed to delete message', { originalError: error.message });
            }

            logger.info('Message deleted successfully', { messageId });
        } catch (error) {
            logger.error('Failed to delete message', { messageId, error });
            throw error;
        }
    }

    /**
     * Map database message to domain message
     */
    private mapDatabaseMessageToMessage(dbMessage: any): ChatMessage {
        return {
            id: `msg_${dbMessage.id}`,
            roomId: dbMessage.room_id,
            senderId: dbMessage.sender_id,
            content: dbMessage.content,
            messageType: dbMessage.message_type as MessageType,
            status: dbMessage.status,
            readAt: dbMessage.read_at,
            createdAt: dbMessage.created_at,
            updatedAt: dbMessage.updated_at,
            audioUrl: dbMessage.audio_url,
            audioDuration: dbMessage.audio_duration,
            fileUrl: dbMessage.file_url,
            fileName: dbMessage.file_name,
            fileSize: dbMessage.file_size,
            fileMimeType: dbMessage.file_mime_type
        };
    }
}

export const chatService = new ChatService();
