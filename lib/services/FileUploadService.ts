/**
 * File Upload Service
 * Business logic for file and audio uploads
 */

import { supabaseAdmin } from '../supabaseAdmin';
import { createLogger } from '../logger/Logger';
import { FileUploadError, ValidationError } from '../errors/AppError';
import { fileUploadSchema, audioUploadSchema } from '../schemas';

const logger = createLogger('FileUploadService');

// File size limits
const FILE_SIZE_LIMIT = 50 * 1024 * 1024; // 50MB
const AUDIO_SIZE_LIMIT = 10 * 1024 * 1024; // 10MB
const AUDIO_DURATION_LIMIT = 600; // 10 minutes

// Allowed file types
const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'text/plain',
    'text/csv'
];

const ALLOWED_AUDIO_TYPES = [
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/webm',
    'audio/mp4'
];

export class FileUploadService {
    /**
     * Generate upload URL for file
     */
    async generateFileUploadUrl(
        userId: string,
        fileName: string,
        fileMimeType: string,
        fileSize: number
    ): Promise<{ uploadUrl: string; fileUrl: string; path: string }> {
        try {
            logger.info('Generating file upload URL', { userId, fileName, fileSize });

            // Validate input
            const validated = fileUploadSchema.parse({
                userId,
                fileName,
                fileMimeType,
                fileSize
            });

            // Validate file type
            if (!ALLOWED_FILE_TYPES.includes(validated.fileMimeType)) {
                throw new FileUploadError('File type not allowed', {
                    mimeType: validated.fileMimeType,
                    allowed: ALLOWED_FILE_TYPES
                });
            }

            // Validate file size
            if (validated.fileSize > FILE_SIZE_LIMIT) {
                throw new FileUploadError('File size exceeds limit', {
                    size: validated.fileSize,
                    limit: FILE_SIZE_LIMIT
                });
            }

            // Generate unique path
            const timestamp = Date.now();
            const random = Math.random().toString(36).slice(2, 9);
            const path = `files/${userId}/${timestamp}_${random}_${validated.fileName}`;

            // Generate signed upload URL
            const { data, error } = await supabaseAdmin.storage
                .from('inkhaven-files')
                .createSignedUploadUrl(path);

            if (error || !data) {
                throw new FileUploadError('Failed to generate upload URL', {
                    originalError: error?.message
                });
            }

            // Generate public URL
            const { data: publicData } = supabaseAdmin.storage
                .from('inkhaven-files')
                .getPublicUrl(path);

            logger.info('File upload URL generated', { path });

            return {
                uploadUrl: data.signedUrl,
                fileUrl: publicData.publicUrl,
                path
            };
        } catch (error) {
            logger.error('Failed to generate file upload URL', { userId, error });
            throw error;
        }
    }

    /**
     * Generate upload URL for audio
     */
    async generateAudioUploadUrl(
        userId: string,
        audioDuration: number,
        fileMimeType: string
    ): Promise<{ uploadUrl: string; audioUrl: string; path: string }> {
        try {
            logger.info('Generating audio upload URL', { userId, audioDuration });

            // Validate input
            const validated = audioUploadSchema.parse({
                userId,
                audioDuration,
                fileMimeType
            });

            // Validate audio type
            if (!ALLOWED_AUDIO_TYPES.includes(validated.fileMimeType)) {
                throw new FileUploadError('Audio type not allowed', {
                    mimeType: validated.fileMimeType,
                    allowed: ALLOWED_AUDIO_TYPES
                });
            }

            // Validate duration
            if (validated.audioDuration > AUDIO_DURATION_LIMIT) {
                throw new FileUploadError('Audio duration exceeds limit', {
                    duration: validated.audioDuration,
                    limit: AUDIO_DURATION_LIMIT
                });
            }

            // Generate unique path
            const timestamp = Date.now();
            const random = Math.random().toString(36).slice(2, 9);
            const extension = this.getAudioExtension(validated.fileMimeType);
            const path = `audio/${userId}/${timestamp}_${random}.${extension}`;

            // Generate signed upload URL
            const { data, error } = await supabaseAdmin.storage
                .from('inkhaven-audio')
                .createSignedUploadUrl(path);

            if (error || !data) {
                throw new FileUploadError('Failed to generate audio upload URL', {
                    originalError: error?.message
                });
            }

            // Generate public URL
            const { data: publicData } = supabaseAdmin.storage
                .from('inkhaven-audio')
                .getPublicUrl(path);

            logger.info('Audio upload URL generated', { path });

            return {
                uploadUrl: data.signedUrl,
                audioUrl: publicData.publicUrl,
                path
            };
        } catch (error) {
            logger.error('Failed to generate audio upload URL', { userId, error });
            throw error;
        }
    }

    /**
     * Delete file
     */
    async deleteFile(path: string): Promise<void> {
        try {
            logger.info('Deleting file', { path });

            const { error } = await supabaseAdmin.storage
                .from('inkhaven-files')
                .remove([path]);

            if (error) {
                logger.warn('Failed to delete file', { path, error });
            }

            logger.info('File deleted', { path });
        } catch (error) {
            logger.error('Failed to delete file', { path, error });
        }
    }

    /**
     * Delete audio
     */
    async deleteAudio(path: string): Promise<void> {
        try {
            logger.info('Deleting audio', { path });

            const { error } = await supabaseAdmin.storage
                .from('inkhaven-audio')
                .remove([path]);

            if (error) {
                logger.warn('Failed to delete audio', { path, error });
            }

            logger.info('Audio deleted', { path });
        } catch (error) {
            logger.error('Failed to delete audio', { path, error });
        }
    }

    /**
     * Get audio extension from MIME type
     */
    private getAudioExtension(mimeType: string): string {
        const mimeToExt: Record<string, string> = {
            'audio/mpeg': 'mp3',
            'audio/wav': 'wav',
            'audio/ogg': 'ogg',
            'audio/webm': 'webm',
            'audio/mp4': 'm4a'
        };

        return mimeToExt[mimeType] || 'mp3';
    }
}

export const fileUploadService = new FileUploadService();
