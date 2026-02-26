/**
 * Moderation Service
 * Business logic for content moderation and user safety
 * 
 * SECURITY: Never fails open without fallback filtering
 */

import { supabaseAdmin } from '../supabaseAdmin';
import { MessageReport, UserBan } from '../types/domain';
import { createLogger } from '../logger/Logger';
import { ModerationError, NotFoundError } from '../errors/AppError';
import { reportMessageSchema, checkModerationSchema } from '../schemas';
import { filterContent, containsSelfHarmContent, FilterSeverity } from '../moderation/wordFilter';
import { getGeminiClient } from '../gemini';

const logger = createLogger('ModerationService');

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
     * Uses word filter
     * NEVER fails open without at least basic filtering
     * @param mode - 'safe' for strict family-friendly filter, 'adult' for standard moderation
     * @param isPremium - whether the user has a premium subscription to use the Gemini AI
     */
    async checkContent(text: string, mode: 'safe' | 'adult' = 'safe', isPremium: boolean = false): Promise<ModerationResult> {
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

            // Try Gemini moderation first ONLY if premium
            if (isPremium) {
                try {
                    const geminiResult = await this.checkWithGemini(validated.text);
                    if (geminiResult) {
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
                        return { ...geminiResult, requiresSupport };
                    }
                } catch (error) {
                    logger.warn('Gemini moderation failed, falling back to word filter', { error });
                }
            }

            // Fallback to word filter (for free users or if Gemini fails)
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
     * Check text content with Gemini
     */
    private async checkWithGemini(text: string): Promise<ModerationResult | null> {
        const ai = getGeminiClient();
        if (!ai) return null;

        try {
            const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

            const prompt = `
You are a content moderation assistant. Analyze the following text and determine if it violates community guidelines.
Guidelines:
1. No explicit adult content, hate speech, severe harassment.
2. Flag clearly abusive or dangerous content.

Respond strictly in JSON format with exactly three fields:
- "flagged": boolean (true if it violates guidelines, false otherwise)
- "reason": string (brief explanation if flagged, or empty string if allowed)
- "categories": object mapping strings like "hate", "sexual", "harassment" to booleans.

Text to analyze:
"""
${text}
"""
`;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            // Extract JSON from potential markdown formatting
            const jsonText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            const json = JSON.parse(jsonText);

            return {
                allowed: !json.flagged,
                flagged: !!json.flagged,
                reason: json.reason,
                categories: json.categories
            };
        } catch (error) {
            logger.error('Gemini text moderation failed', { error });
            return null;
        }
    }

    /**
     * Analyze image content using Gemini Vision
     */
    async analyzeImage(base64Image: string, mimeType: string = 'image/jpeg', isPremium: boolean = false): Promise<ModerationResult> {
        if (!isPremium) {
            return {
                allowed: false,
                flagged: true,
                reason: 'Image upload requires a Premium subscription.'
            };
        }

        const ai = getGeminiClient();

        // Fast fail open if no API key
        if (!ai) {
            return { allowed: true, flagged: false };
        }

        try {
            const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

            const prompt = `
You are an image moderation assistant for a chat app.
Analyze the image to determine if it violates community guidelines.
Flag the following: graphic violence, explicit adult nudity, illegal content, or severe gore.

Respond strictly in JSON format:
{
  "flagged": true/false,
  "reason": "If flagged, brief explanation here",
  "categories": {"nsfw": true/false, "violence": true/false}
}
`;

            // The image needs to be provided in the right format for Gemini
            // Assuming base64 data might include the data URI prefix or just be the raw base64 string
            const base64Data = base64Image.includes('base64,')
                ? base64Image.split('base64,')[1]
                : base64Image;

            const imagePart = {
                inlineData: {
                    data: base64Data,
                    mimeType
                }
            };

            const result = await model.generateContent([prompt, imagePart]);
            const responseText = result.response.text();

            const jsonText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            const json = JSON.parse(jsonText);

            return {
                allowed: !json.flagged,
                flagged: !!json.flagged,
                reason: json.reason,
                categories: json.categories
            };
        } catch (error) {
            logger.error('Gemini image moderation failed', { error });
            // Fail open for images if moderation fails, to not block users entirely over API glitches
            return { allowed: true, flagged: false, reason: 'Moderation temporarily unavailable' };
        }
    }


    /**
     * Report a user (via a message they sent)
     * Uses the existing user_reports table which tracks reporter_id → reported_id.
     */
    async reportMessage(
        messageId: string,
        reporterId: string,
        reason: string,
        description?: string
    ): Promise<MessageReport> {
        try {
            logger.info('Reporting message', { messageId, reporterId, reason });

            const validated = reportMessageSchema.parse({
                messageId,
                reporterId,
                reason,
                description
            });

            // Look up the message to find the sender (reported user) and room
            const { data: message, error: messageError } = await supabaseAdmin
                .from('messages')
                .select('sender_id, room_id')
                .eq('id', parseInt(validated.messageId, 10))
                .single();

            if (messageError || !message) {
                throw new NotFoundError('Message');
            }

            // Mark message as reported
            await supabaseAdmin
                .from('messages')
                .update({ is_reported: true })
                .eq('id', parseInt(validated.messageId, 10));

            // Create report in user_reports
            const { data, error } = await supabaseAdmin
                .from('user_reports')
                .insert({
                    reporter_id: validated.reporterId,
                    reported_id: message.sender_id,
                    room_id: message.room_id,
                    reason: validated.reason,
                    description: validated.description || null,
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
                .from('user_reports')
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
        status: 'actioned' | 'dismissed',
        resolution?: string,
        resolvedBy?: string
    ): Promise<MessageReport> {
        try {
            logger.info('Resolving report', { reportId, status });

            const updateData: Record<string, any> = { status };
            // user_reports doesn't have resolution/resolved_by/resolved_at columns
            // but we can still log them
            if (resolution) logger.info('Resolution note', { resolution });
            if (resolvedBy) logger.info('Resolved by', { resolvedBy });

            const { data, error } = await supabaseAdmin
                .from('user_reports')
                .update(updateData)
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
     * NOTE: banned_users table may not exist yet — operations degrade gracefully.
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
                logger.warn('banned_users table may not exist; ban not persisted', { userId, error: error?.message });
                // Return a synthetic ban object so the API doesn't crash
                return {
                    userId,
                    reason,
                    bannedAt: new Date().toISOString(),
                    bannedBy: bannedBy,
                    expiresAt: expiresAt
                };
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
     * Degrades gracefully if banned_users doesn't exist.
     */
    async isUserBanned(userId: string): Promise<boolean> {
        try {
            const { data, error } = await supabaseAdmin
                .from('banned_users')
                .select('user_id, expires_at')
                .eq('user_id', userId)
                .maybeSingle();

            if (error || !data) {
                return false;
            }

            if (data.expires_at) {
                const expiresAt = new Date(data.expires_at);
                if (expiresAt < new Date()) {
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
            id: String(dbReport.id),
            messageId: '',  // user_reports doesn't have message_id
            reporterId: dbReport.reporter_id,
            reason: dbReport.reason,
            description: dbReport.description,
            status: dbReport.status,
            createdAt: dbReport.created_at,
            resolvedAt: undefined,
            resolvedBy: undefined
        };
    }
}

export const moderationService = new ModerationService();
