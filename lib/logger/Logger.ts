/**
 * Structured Logger
 * Professional-grade logging with Sentry integration
 */

import * as Sentry from '@sentry/nextjs';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
    [key: string]: any;
}

export interface Logger {
    debug(message: string, context?: LogContext): void;
    info(message: string, context?: LogContext): void;
    warn(message: string, context?: LogContext): void;
    error(message: string, context?: LogContext): void;
}

export class StructuredLogger implements Logger {
    constructor(private service: string) { }

    private log(level: LogLevel, message: string, context?: LogContext) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            service: this.service,
            message,
            ...context
        };

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            const logFn = console[level] || console.log;
            logFn(`[${this.service}] ${message}`, context || '');
        }

        // Send to Sentry for errors and warnings
        if (level === 'error') {
            Sentry.captureException(new Error(message), {
                level: 'error',
                tags: { service: this.service },
                extra: context
            });
        } else if (level === 'warn') {
            Sentry.captureMessage(message, {
                level: 'warning',
                tags: { service: this.service },
                extra: context
            });
        }

        // In production, you might want to send to a logging service
        // Example: LogRocket, DataDog, etc.
    }

    debug(message: string, context?: LogContext): void {
        this.log('debug', message, context);
    }

    info(message: string, context?: LogContext): void {
        this.log('info', message, context);
    }

    warn(message: string, context?: LogContext): void {
        this.log('warn', message, context);
    }

    error(message: string, context?: LogContext): void {
        this.log('error', message, context);
    }
}

/**
 * Create a logger instance for a service
 */
export function createLogger(service: string): Logger {
    return new StructuredLogger(service);
}

/**
 * Global logger instance
 */
export const logger = createLogger('InkHaven');
