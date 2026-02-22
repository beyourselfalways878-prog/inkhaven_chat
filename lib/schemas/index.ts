/**
 * Zod Validation Schemas
 * Professional-grade input validation
 */

import { z } from 'zod';

// ============================================================================
// Common Schemas
// ============================================================================

export const uuidSchema = z.string().uuid('Invalid UUID format');
export const emailSchema = z.string().email('Invalid email format');
export const urlSchema = z.string().url('Invalid URL format');

// ============================================================================
// User & Profile Schemas
// ============================================================================

export const comfortLevelSchema = z.enum(['gentle', 'balanced', 'bold']);
export const matchModeSchema = z.enum(['casual', 'deep']);

export const createProfileSchema = z.object({
    userId: uuidSchema,
    displayName: z.string().min(1).max(50).optional(),
    interests: z.array(z.string().max(30)).max(10).optional(),
    comfortLevel: comfortLevelSchema.optional()
});

export const updateProfileSchema = z.object({
    userId: uuidSchema,
    displayName: z.string().min(1).max(50).optional(),
    interests: z.array(z.string().max(30)).max(10).optional(),
    comfortLevel: comfortLevelSchema.optional()
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// ============================================================================
// Chat Message Schemas
// ============================================================================

export const messageTypeSchema = z.enum(['text', 'audio', 'file']);

export const sendTextMessageSchema = z.object({
    roomId: uuidSchema,
    senderId: uuidSchema,
    content: z.string().min(1).max(5000),
    messageType: z.literal('text')
});

export const sendAudioMessageSchema = z.object({
    roomId: uuidSchema,
    senderId: uuidSchema,
    audioUrl: urlSchema,
    audioDuration: z.number().positive(),
    messageType: z.literal('audio')
});

export const sendFileMessageSchema = z.object({
    roomId: uuidSchema,
    senderId: uuidSchema,
    fileUrl: urlSchema,
    fileName: z.string().min(1).max(255),
    fileSize: z.number().positive().max(50 * 1024 * 1024), // 50MB max
    fileMimeType: z.string(),
    messageType: z.literal('file')
});

export const sendMessageSchema = z.union([
    sendTextMessageSchema,
    sendAudioMessageSchema,
    sendFileMessageSchema
]);

export type SendTextMessageInput = z.infer<typeof sendTextMessageSchema>;
export type SendAudioMessageInput = z.infer<typeof sendAudioMessageSchema>;
export type SendFileMessageInput = z.infer<typeof sendFileMessageSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;

// ============================================================================
// Room Schemas
// ============================================================================

export const createRoomSchema = z.object({
    userId: uuidSchema
});

export const joinRoomSchema = z.object({
    userId: uuidSchema,
    roomId: uuidSchema
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type JoinRoomInput = z.infer<typeof joinRoomSchema>;

// ============================================================================
// Matching Schemas
// ============================================================================

export const enqueueMatchingSchema = z.object({
    userId: uuidSchema,
    mode: matchModeSchema.optional()
});

export const findMatchSchema = z.object({
    userId: uuidSchema,
    mode: matchModeSchema.optional()
});

export type EnqueueMatchingInput = z.infer<typeof enqueueMatchingSchema>;
export type FindMatchInput = z.infer<typeof findMatchSchema>;

// ============================================================================
// Moderation Schemas
// ============================================================================

export const reportReasonSchema = z.enum(['spam', 'harassment', 'inappropriate', 'underage', 'other']);

export const reportMessageSchema = z.object({
    messageId: uuidSchema,
    reporterId: uuidSchema,
    reason: reportReasonSchema,
    description: z.string().max(500).optional()
});

export const checkModerationSchema = z.object({
    text: z.string().min(1).max(5000)
});

export type ReportMessageInput = z.infer<typeof reportMessageSchema>;
export type CheckModerationInput = z.infer<typeof checkModerationSchema>;

// ============================================================================
// File Upload Schemas
// ============================================================================

export const fileUploadSchema = z.object({
    fileName: z.string().min(1).max(255),
    fileSize: z.number().positive().max(50 * 1024 * 1024), // 50MB max
    fileMimeType: z.string(),
    userId: uuidSchema
});

export const audioUploadSchema = z.object({
    audioDuration: z.number().positive().max(600), // 10 minutes max
    fileMimeType: z.string().regex(/^audio\//),
    userId: uuidSchema
});

export type FileUploadInput = z.infer<typeof fileUploadSchema>;
export type AudioUploadInput = z.infer<typeof audioUploadSchema>;

// ============================================================================
// Reaction Schemas
// ============================================================================

export const toggleReactionSchema = z.object({
    messageId: uuidSchema,
    userId: uuidSchema,
    reaction: z.string().max(10)
});

export type ToggleReactionInput = z.infer<typeof toggleReactionSchema>;

// ============================================================================
// Pagination Schemas
// ============================================================================

export const paginationSchema = z.object({
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(20)
});

export type PaginationInput = z.infer<typeof paginationSchema>;

// ============================================================================
// Auth Schemas
// ============================================================================

export const anonymousAuthSchema = z.object({
    // No required fields for anonymous auth
});

export type AnonymousAuthInput = z.infer<typeof anonymousAuthSchema>;
