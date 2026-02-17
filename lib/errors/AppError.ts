/* eslint-disable no-unused-vars */
/**
 * Application Error Classes
 * Professional error handling with proper hierarchy
 */

export class AppError extends Error {
    constructor(
        public code: string,
        public message: string,
        public statusCode: number = 500,
        public details?: Record<string, any>
    ) {
        super(message);
        this.name = 'AppError';
        Object.setPrototypeOf(this, AppError.prototype);
    }

    toJSON() {
        return {
            error: this.code,
            message: this.message,
            statusCode: this.statusCode,
            ...(this.details && { details: this.details })
        };
    }
}

export class ValidationError extends AppError {
    constructor(message: string, details?: Record<string, any>) {
        super('VALIDATION_ERROR', message, 400, details);
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = 'Unauthorized') {
        super('AUTHENTICATION_ERROR', message, 401);
        Object.setPrototypeOf(this, AuthenticationError.prototype);
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string = 'Forbidden') {
        super('AUTHORIZATION_ERROR', message, 403);
        Object.setPrototypeOf(this, AuthorizationError.prototype);
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string) {
        super('NOT_FOUND', `${resource} not found`, 404);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super('CONFLICT', message, 409);
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}

export class RateLimitError extends AppError {
    constructor(retryAfter: number) {
        super('RATE_LIMITED', 'Too many requests', 429, { retryAfter });
        Object.setPrototypeOf(this, RateLimitError.prototype);
    }
}

export class InternalServerError extends AppError {
    constructor(message: string = 'Internal server error', details?: Record<string, any>) {
        super('INTERNAL_SERVER_ERROR', message, 500, details);
        Object.setPrototypeOf(this, InternalServerError.prototype);
    }
}

export class ChatError extends AppError {
    constructor(message: string, details?: Record<string, any>) {
        super('CHAT_ERROR', message, 500, details);
        Object.setPrototypeOf(this, ChatError.prototype);
    }
}

export class MatchingError extends AppError {
    constructor(message: string, details?: Record<string, any>) {
        super('MATCHING_ERROR', message, 500, details);
        Object.setPrototypeOf(this, MatchingError.prototype);
    }
}

export class FileUploadError extends AppError {
    constructor(message: string, details?: Record<string, any>) {
        super('FILE_UPLOAD_ERROR', message, 400, details);
        Object.setPrototypeOf(this, FileUploadError.prototype);
    }
}

export class ModerationError extends AppError {
    constructor(message: string, details?: Record<string, any>) {
        super('MODERATION_ERROR', message, 500, details);
        Object.setPrototypeOf(this, ModerationError.prototype);
    }
}

/**
 * Type guard to check if error is AppError
 */
export function isAppError(error: unknown): error is AppError {
    return error instanceof AppError;
}

/**
 * Type guard to check if error is Error
 */
export function isError(error: unknown): error is Error {
    return error instanceof Error;
}
