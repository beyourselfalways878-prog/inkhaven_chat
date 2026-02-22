/**
 * POST /api/profile/update
 * Update user profile (authenticated — users can only update their own)
 */

import { NextRequest, NextResponse } from 'next/server';
import { profileService } from '../../../../lib/services/ProfileService';
import { handleApiError, generateRequestId } from '../../../../lib/middleware/errorHandler';
import { updateProfileSchema } from '../../../../lib/schemas';
import { logger } from '../../../../lib/logger/Logger';
import { rateLimit } from '../../../../lib/rateLimit';
import { getAuthenticatedUser } from '../../../../lib/auth';
import { AppError } from '../../../../lib/errors/AppError';

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();

  try {
    logger.info('POST /api/profile/update', { requestId });

    // Authenticate
    const user = await getAuthenticatedUser(req);

    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') ?? 'local';
    const limit = await rateLimit(`profile:update:${ip}`, 10, 60);

    if (!limit.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error: 'RATE_LIMITED',
          message: 'Too many requests',
          statusCode: 429
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validated = updateProfileSchema.parse(body);

    // Authorization: users can only update their own profile
    if (validated.userId !== user.id) {
      throw new AppError('FORBIDDEN', 'You can only update your own profile', 403);
    }

    const profile = await profileService.updateProfile(validated.userId, validated);

    logger.info('Profile updated successfully', { requestId, userId: validated.userId });

    return NextResponse.json(
      {
        ok: true,
        data: profile
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Failed to update profile', { requestId, error });
    return handleApiError(error, requestId);
  }
}

