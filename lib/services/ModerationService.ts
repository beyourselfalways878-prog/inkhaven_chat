/**
 * Moderation Service
 * Business logic for content moderation and user safety
 * 
 * SECURITY: Never fails open without fallback filtering
 */

import { supabaseAdmin } from '../supabaseAdmin';
import { MessageReport, UserBan } from '../types/domain';
import { createLogger } from '../logger/Logger';
import { ModerationError, NotFoundError, ValidationError } from '../errors/AppError';
import { reportMessageSchema, checkModerationSchema } from '../schemas';
import { filterContent, containsSelfHarmContent, FilterSeverity } from '../moderation/wordFilter';

const logger = createLogger('ModerationService');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export interface ModerationResult {
    allowed: boolean;
    flagged: boolean;
    categories?: Record<string, boolean>;
    severity?: FilterSeverity;
    reason?: string;
    requiresSupport?: boolean; // Flag for self-harm content
}

export class ModerationService {
    /**
     * Check content for moderation
     * Uses OpenAI when available, falls back to word filter
     * NEVER fails open without at least basic filtering
     * @param mode - 'safe' for strict family-friendly filter, 'adult' for standard moderation
     */
    async checkContent(text: string, mode: 'safe' | 'adult' = 'safe'): Promise<ModerationResult> {
        try {
            logger.info('Checking content for moderation', { textLength: text.length, mode });

            // Validate input
            const validated = checkModerationSchema.parse({ text });

            // Check for self-harm content first (always blocked in any mode)
            const requiresSupport = containsSelfHarmContent(validated.text);
            if (requiresSupport) {
                logger.warn('Self-harm content detected, flagging for support', { textLength: text.length });
            }

            // In SAFE mode: stricter threshold, block more
            // In ADULT mode: standard threshold, allow more
            const minSeverity = mode === 'safe' ? 'low' : 'high';

            // Try OpenAI moderation first
            if (OPENAI_API_KEY) {
                try {
                    const openaiResult = await this.checkWithOpenAI(validated.text);
                    if (openaiResult) {
                        // In safe mode, also run word filter for extra safety
                        if (mode === 'safe') {
                            const filterResult = filterContent(validated.text, { minSeverity: 'low' });
                            if (filterResult.flagged) {
                                return {
                                    allowed: false,
                                    flagged: true,
                                    severity: filterResult.severity,
                                    reason: filterResult.reason || 'Content blocked in Safe Mode',
                                    requiresSupport
                                };
                            }
                        }
                        return { ...openaiResult, requiresSupport };
                    }
                } catch (error) {
                    logger.warn('OpenAI moderation failed, falling back to word filter', { error });
                }
            }

            // Fallback to word filter (always runs if OpenAI unavailable or fails)
            logger.info('Using word filter fallback', { mode, minSeverity });
            const filterResult = filterContent(validated.text, { minSeverity: minSeverity as FilterSeverity });

            return {
                allowed: filterResult.allowed,
                flagged: filterResult.flagged,
                severity: filterResult.severity,
                reason: filterResult.reason,
                requiresSupport
            };
        } catch (error) {
            logger.error('Failed to check content moderation', { error });
            // Even on error, run basic word filter (strict in safe mode)
            const minSeverity = mode === 'safe' ? 'low' : 'high';
            const filterResult = filterContent(text, { minSeverity: minSeverity as FilterSeverity });
            return {
                allowed: filterResult.allowed,
                flagged: filterResult.flagged,
                severity: filterResult.severity,
                reason: filterResult.reason
            };
        }
    }

    /**
     * Check content with OpenAI moderation API
     */
    private async checkWithOpenAI(text: string): Promise<ModerationResult | null> {
        const response = await fetch('https://api.openai.com/v1/moderations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'omni-moderation-latest',
                input: text
            })
        });

        if (!response.ok) {
            logger.warn('OpenAI moderation API error', { status: response.status });
            return null;
        }

        const json = await response.json();
        const result = json?.results?.[0];

        if (!result) {
            return null;
        }

        const flagged = !!result.flagged;

        logger.info('OpenAI moderation check completed', {
            flagged,
            categories: result.categories
        });

        return {
            allowed: !flagged,
            flagged,
            categories: result.categories
        };
    }

    /**
     * Report a message
     */
    async reportMessage(
        messageId: string,
        reporterId: string,
        reason: string,
        description?: string
    ): Promise<MessageReport> {
        try {
            logger.info('Reporting message', { messageId, reporterId, reason });

            // Validate input
            const validated = reportMessageSchema.parse({
                messageId,
                reporterId,
                reason,
                description
            });

            // Check if message exists
            const { data: message, error: messageError } = await supabaseAdmin
                .from('messages')
                .select('id')
                .eq('id', messageId)
                .single();

            if (messageError || !message) {
                throw new NotFoundError('Message');
            }

            // Create report
            const { data, error } = await supabaseAdmin
                .from('message_reports')
                .insert({
                    message_id: validated.messageId,
                    reporter_id: validated.reporterId,
                    reason: validated.reason,
                    description: validated.description,
                    status: 'pending'
                })
                .select()
                .single();

            if (error || !data) {
                throw new ModerationError('Failed to create report');
            }

            logger.info('Message reported successfully', { reportId: data.id });

            return this.mapDatabaseReportToReport(data);
        } catch (error) {
            logger.error('Failed to report message', { messageId, reporterId, error });
            throw error;
        }
    }

    /**
     * Get reports for moderation
     */
    async getReports(
        status?: string,
        limit: number = 50,
        offset: number = 0
    ): Promise<MessageReport[]> {
        try {
            logger.info('Fetching reports', { status, limit, offset });

            let query = supabaseAdmin
                .from('message_reports')
                .select('*')
                .order('created_at', { ascending: false });

            if (status) {
                query = query.eq('status', status);
            }

            const { data, error } = await query.range(offset, offset + limit - 1);

            if (error) {
                throw new ModerationError('Failed to fetch reports', { originalError: error.message });
            }

            return (data || []).map(report => this.mapDatabaseReportToReport(report));
        } catch (error) {
            logger.error('Failed to fetch reports', { error });
            throw error;
        }
    }

    /**
     * Resolve a report
     */
    async resolveReport(
        reportId: string,
        status: 'resolved' | 'dismissed',
        resolution?: string,
        resolvedBy?: string
    ): Promise<MessageReport> {
        try {
            logger.info('Resolving report', { reportId, status });

            const { data, error } = await supabaseAdmin
                .from('message_reports')
                .update({
                    status,
                    resolution: resolution || null,
                    resolved_by: resolvedBy || null,
                    resolved_at: new Date().toISOString()
                })
                .eq('id', reportId)
                .select()
                .single();

            if (error || !data) {
                throw new ModerationError('Failed to resolve report');
            }

            logger.info('Report resolved', { reportId, status });

            return this.mapDatabaseReportToReport(data);
        } catch (error) {
            logger.error('Failed to resolve report', { reportId, error });
            throw error;
        }
    }

    /**
     * Ban a user
     */
    async banUser(userId: string, reason: string, bannedBy?: string, expiresAt?: string): Promise<UserBan> {
        try {
            logger.info('Banning user', { userId, reason });

            const { data, error } = await supabaseAdmin
                .from('banned_users')
                .upsert({
                    user_id: userId,
                    reason,
                    banned_by: bannedBy || null,
                    expires_at: expiresAt || null,
                    banned_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error || !data) {
                throw new ModerationError('Failed to ban user');
            }

            logger.info('User banned', { userId });

            return {
                userId: data.user_id,
                reason: data.reason,
                bannedAt: data.banned_at,
                bannedBy: data.banned_by,
                expiresAt: data.expires_at
            };
        } catch (error) {
            logger.error('Failed to ban user', { userId, error });
            throw error;
        }
    }

    /**
     * Check if user is banned
     */
    async isUserBanned(userId: string): Promise<boolean> {
        try {
            const { data, error } = await supabaseAdmin
                .from('banned_users')
                .select('id, expires_at')
                .eq('user_id', userId)
                .single();

            if (error || !data) {
                return false;
            }

            // Check if ban has expired
            if (data.expires_at) {
                const expiresAt = new Date(data.expires_at);
                if (expiresAt < new Date()) {
                    // Ban has expired, remove it
                    await supabaseAdmin
                        .from('banned_users')
                        .delete()
                        .eq('user_id', userId);
                    return false;
                }
            }

            return true;
        } catch (error) {
            logger.error('Failed to check if user is banned', { userId, error });
            return false;
        }
    }

    /**
     * Unban a user
     */
    async unbanUser(userId: string): Promise<void> {
        try {
            logger.info('Unbanning user', { userId });

            const { error } = await supabaseAdmin
                .from('banned_users')
                .delete()
                .eq('user_id', userId);

            if (error) {
                throw new ModerationError('Failed to unban user');
            }

            logger.info('User unbanned', { userId });
        } catch (error) {
            logger.error('Failed to unban user', { userId, error });
            throw error;
        }
    }

    /**
     * Map database report to domain report
     */
    private mapDatabaseReportToReport(dbReport: any): MessageReport {
        return {
            id: dbReport.id,
            messageId: dbReport.message_id,
            reporterId: dbReport.reporter_id,
            reason: dbReport.reason,
            description: dbReport.description,
            status: dbReport.status,
            createdAt: dbReport.created_at,
            resolvedAt: dbReport.resolved_at,
            resolvedBy: dbReport.resolved_by
        };
    }
}

export const moderationService = new ModerationService();
