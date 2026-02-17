/**
 * Profile Service
 * Business logic for user profile operations
 */

import { supabaseAdmin } from '../supabaseAdmin';
import { UserProfile } from '../types/domain';
import { createLogger } from '../logger/Logger';
import { ValidationError, NotFoundError } from '../errors/AppError';
import { updateProfileSchema, UpdateProfileInput } from '../schemas';
import { computeEmbedding } from '../embeddings';

const logger = createLogger('ProfileService');

export class ProfileService {
    /**
     * Get user profile
     */
    async getProfile(userId: string): Promise<UserProfile> {
        try {
            logger.info('Fetching profile', { userId });

            const { data, error } = await supabaseAdmin
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error || !data) {
                throw new NotFoundError('Profile');
            }

            return this.mapDatabaseProfileToProfile(data);
        } catch (error) {
            logger.error('Failed to fetch profile', { userId, error });
            throw error;
        }
    }

    /**
     * Create user profile
     */
    async createProfile(userId: string, displayName?: string): Promise<UserProfile> {
        try {
            logger.info('Creating profile', { userId, displayName });

            const inkId = `ink_${userId.replace(/-/g, '').slice(0, 8)}`;

            const { data, error } = await supabaseAdmin
                .from('profiles')
                .insert({
                    id: userId,
                    ink_id: inkId,
                    display_name: displayName || null,
                    interests: [],
                    comfort_level: 'balanced',
                    reputation: 50,
                    is_ephemeral: true
                })
                .select()
                .single();

            if (error || !data) {
                throw new ValidationError('Failed to create profile');
            }

            logger.info('Profile created successfully', { userId, inkId });

            return this.mapDatabaseProfileToProfile(data);
        } catch (error) {
            logger.error('Failed to create profile', { userId, error });
            throw error;
        }
    }

    /**
     * Update user profile
     */
    async updateProfile(userId: string, input: UpdateProfileInput): Promise<UserProfile> {
        try {
            logger.info('Updating profile', { userId });

            // Validate input
            const validated = updateProfileSchema.parse({
                userId,
                displayName: input.displayName,
                interests: input.interests,
                comfortLevel: input.comfortLevel
            });

            // Build update payload
            const updatePayload: Record<string, any> = {};

            if (validated.displayName !== undefined) {
                updatePayload.display_name = validated.displayName;
            }

            if (validated.interests !== undefined) {
                updatePayload.interests = validated.interests;
            }

            if (validated.comfortLevel !== undefined) {
                updatePayload.comfort_level = validated.comfortLevel;
            }

            updatePayload.updated_at = new Date().toISOString();

            // Update profile
            let { data, error } = await supabaseAdmin
                .from('profiles')
                .update(updatePayload)
                .eq('id', userId)
                .select()
                .single();

            // If profile doesn't exist, create it and retry update
            if (!data) {
                logger.info('Profile not found during update, creating new one', { userId });
                await this.createProfile(userId, validated.displayName);

                // Retry update
                const res = await supabaseAdmin
                    .from('profiles')
                    .update(updatePayload)
                    .eq('id', userId)
                    .select()
                    .single();

                data = res.data;
                error = res.error;
            }

            if (error || !data) {
                throw new ValidationError('Failed to update profile');
            }

            // Update interests if provided
            if (validated.interests !== undefined) {
                await this.updateInterests(userId, validated.interests);
            }

            // Update embeddings if display name or interests changed
            if (validated.displayName !== undefined || validated.interests !== undefined) {
                await this.updateEmbeddings(userId, validated.displayName, validated.interests);
            }

            logger.info('Profile updated successfully', { userId });

            return this.mapDatabaseProfileToProfile(data);
        } catch (error) {
            logger.error('Failed to update profile', { userId, error });
            throw error;
        }
    }

    /**
     * Update user interests
     */
    private async updateInterests(userId: string, interests: string[]): Promise<void> {
        try {
            // Delete existing interests
            await supabaseAdmin
                .from('user_interests')
                .delete()
                .eq('user_id', userId);

            // Insert new interests
            if (interests.length > 0) {
                const rows = interests.map(interest => ({
                    user_id: userId,
                    interest,
                    weight: 1
                }));

                const { error } = await supabaseAdmin
                    .from('user_interests')
                    .insert(rows);

                if (error) {
                    logger.warn('Failed to update interests', { userId, error });
                }
            }
        } catch (error) {
            logger.error('Failed to update interests', { userId, error });
        }
    }

    /**
     * Update user embeddings for ML-based matching
     */
    private async updateEmbeddings(
        userId: string,
        displayName?: string,
        interests?: string[]
    ): Promise<void> {
        try {
            // Build embedding text
            const embeddingText = [displayName, ...(interests || [])]
                .filter(Boolean)
                .join(' · ');

            if (!embeddingText) {
                return;
            }

            // Compute embedding
            const embedding = await computeEmbedding(embeddingText);

            if (!embedding) {
                logger.warn('Failed to compute embedding', { userId });
                return;
            }

            // Save embedding
            const { error } = await supabaseAdmin
                .from('user_embeddings')
                .upsert({
                    user_id: userId,
                    embedding,
                    updated_at: new Date().toISOString()
                });

            if (error) {
                logger.warn('Failed to save embedding', { userId, error });
            }
        } catch (error) {
            logger.error('Failed to update embeddings', { userId, error });
        }
    }

    /**
     * Get user reputation
     */
    async getReputation(userId: string): Promise<number> {
        try {
            const { data, error } = await supabaseAdmin
                .from('profiles')
                .select('reputation')
                .eq('id', userId)
                .single();

            if (error || !data) {
                return 50; // Default reputation
            }

            return data.reputation;
        } catch (error) {
            logger.error('Failed to get reputation', { userId, error });
            return 50;
        }
    }

    /**
     * Update user reputation
     */
    async updateReputation(userId: string, delta: number): Promise<number> {
        try {
            const currentReputation = await this.getReputation(userId);
            const newReputation = Math.max(0, Math.min(100, currentReputation + delta));

            const { data, error } = await supabaseAdmin
                .from('profiles')
                .update({ reputation: newReputation })
                .eq('id', userId)
                .select('reputation')
                .single();

            if (error || !data) {
                return currentReputation;
            }

            logger.info('Reputation updated', { userId, delta, newReputation });

            return data.reputation;
        } catch (error) {
            logger.error('Failed to update reputation', { userId, error });
            return 50;
        }
    }

    /**
     * Map database profile to domain profile
     */
    private mapDatabaseProfileToProfile(dbProfile: any): UserProfile {
        return {
            id: dbProfile.id,
            inkId: dbProfile.ink_id,
            displayName: dbProfile.display_name,
            interests: dbProfile.interests || [],
            comfortLevel: dbProfile.comfort_level,
            reputation: dbProfile.reputation,
            isEphemeral: dbProfile.is_ephemeral,
            createdAt: dbProfile.created_at,
            updatedAt: dbProfile.updated_at
        };
    }
}

export const profileService = new ProfileService();
