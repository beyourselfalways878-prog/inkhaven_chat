/* eslint-disable no-unused-vars */
/**
 * API Error Handler Middleware
 * Professional error handling for Next.js API routes
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { isAppError, isError } from '../errors/AppError';
import { logger } from '../logger/Logger';

export interface ErrorResponse {
    ok: false;
    error: string;
    message: string;
    statusCode: number;
    details?: Record<string, any>;
    requestId?: string;
}

/**
 * Handle API errors and return proper response
 */
export function handleApiError(error: unknown, requestId?: string): NextResponse<ErrorResponse> {
    // Handle AppError
    if (isAppError(error)) {
        logger.warn('Application error', {
            code: error.code,
            message: error.message,
            statusCode: error.statusCode,
            requestId
        });

        return NextResponse.json(
            {
                ok: false,
                error: error.code,
                message: error.message,
                statusCode: error.statusCode,
                ...(error.details && { details: error.details }),
                requestId
            },
            { status: error.statusCode }
        );
    }

    // Handle Zod validation errors
    if (error instanceof ZodError) {
        const fieldErrors = error.issues.reduce(
            (acc, err) => {
                const path = err.path.join('.');
                acc[path] = err.message;
                return acc;
            },
            {} as Record<string, string>
        );

        logger.warn('Validation error', {
            errors: fieldErrors,
            requestId
        });

        return NextResponse.json(
            {
                ok: false,
                error: 'VALIDATION_ERROR',
                message: 'Invalid request data',
                statusCode: 400,
                details: { fieldErrors },
                requestId
            },
            { status: 400 }
        );
    }

    // Handle standard Error
    if (isError(error)) {
        logger.error('Unexpected error', {
            message: error.message,
            stack: error.stack,
            requestId
        });

        return NextResponse.json(
            {
                ok: false,
                error: 'INTERNAL_SERVER_ERROR',
                message: 'An unexpected error occurred',
                statusCode: 500,
                requestId
            },
            { status: 500 }
        );
    }

    // Handle unknown error
    logger.error('Unknown error', {
        error: String(error),
        requestId
    });

    return NextResponse.json(
        {
            ok: false,
            error: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred',
            statusCode: 500,
            requestId
        },
        { status: 500 }
    );
}

/**
 * Wrap API handler with error handling
 */
export function withErrorHandler<T extends (..._args: any[]) => Promise<any>>(
    handler: T
): T {
    return (async (...args: any[]) => {
        try {
            return await handler(...args);
        } catch (error) {
            return handleApiError(error);
        }
    }) as T;
}

/**
 * Generate request ID for tracking
 */
export function generateRequestId(): string {
    return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
