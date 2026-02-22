/**
 * Domain Types - Core business entities
 * Professional-grade type definitions for InkHaven
 */

export type MessageType = 'text' | 'audio' | 'file';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';
export type ComfortLevel = 'gentle' | 'balanced' | 'bold';
export type MatchMode = 'casual' | 'deep';

/**
 * User Profile
 */
export interface UserProfile {
    id: string;
    inkId: string;
    displayName: string | null;
    interests: string[];
    comfortLevel: ComfortLevel;
    reputation: number;
    isEphemeral: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * Chat Message with support for text, audio, and files
 */
export interface ChatMessage {
    id: string;
    roomId: string;
    senderId: string;
    senderName?: string;
    content: string; // Text content or file metadata
    messageType: MessageType;
    status: MessageStatus;
    readAt: string | null;
    createdAt: string;
    updatedAt: string;

    // Audio message specific
    audioUrl?: string;
    audioDuration?: number;

    // File message specific
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    fileMimeType?: string;
    metadata?: any;
}

/**
 * Chat Room
 */
export interface ChatRoom {
    id: string;
    participantIds: string[];
    createdAt: string;
    updatedAt: string;
    lastMessageAt?: string;
}

/**
 * Room Participant
 */
export interface RoomParticipant {
    roomId: string;
    userId: string;
    joinedAt: string;
    lastSeenAt: string;
}

/**
 * Matching Queue Entry
 */
export interface MatchingQueueEntry {
    userId: string;
    mode: MatchMode;
    interests: string[];
    waitingSince: string;
    matchedWith?: string;
    currentRoomId?: string;
}

/**
 * Message Report
 */
export interface MessageReport {
    id: string;
    messageId: string;
    reporterId: string;
    reason: 'spam' | 'harassment' | 'inappropriate' | 'other';
    description?: string;
    status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
    createdAt: string;
    resolvedAt?: string;
    resolvedBy?: string;
}

/**
 * User Ban
 */
export interface UserBan {
    userId: string;
    reason: string;
    bannedAt: string;
    bannedBy?: string;
    expiresAt?: string;
}

/**
 * Moderation Action
 */
export interface ModerationAction {
    id: string;
    targetUserId: string;
    actionType: 'warning' | 'mute' | 'ban';
    reason: string;
    duration?: number; // in minutes
    createdAt: string;
    createdBy: string;
}

/**
 * User Embedding for ML-based matching
 */
export interface UserEmbedding {
    userId: string;
    embedding: number[];
    lastChatEmbedding?: number[];
    updatedAt: string;
}

/**
 * Session State
 */
export interface SessionState {
    userId: string | null;
    inkId: string | null;
    token: string | null;
    displayName: string | null;
    interests: string[] | null;
    comfortLevel: ComfortLevel | null;
}

/**
 * API Response Wrapper
 */
export interface ApiResponse<T = any> {
    ok: boolean;
    data?: T;
    error?: string;
    code?: string;
    details?: Record<string, any>;
}

/**
 * Pagination
 */
export interface PaginationParams {
    page: number;
    limit: number;
    offset: number;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}

/**
 * File Upload Metadata
 */
export interface FileUploadMetadata {
    fileName: string;
    fileSize: number;
    fileMimeType: string;
    uploadedAt: string;
    uploadedBy: string;
}

/**
 * Audio Message Metadata
 */
export interface AudioMessageMetadata {
    duration: number; // in seconds
    mimeType: string;
    uploadedAt: string;
    uploadedBy: string;
}
