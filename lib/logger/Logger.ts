/* eslint-disable no-unused-vars */
/**
 * Structured Logger
 * Professional-grade logging with console output
 */

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

        const logFn = console[level] || console.log;
        logFn(`[${this.service}]`, logEntry);
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
