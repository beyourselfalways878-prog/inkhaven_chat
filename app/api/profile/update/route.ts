/**
 * POST /api/profile/update
 * Update user profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { profileService } from '../../../../lib/services/ProfileService';
import { handleApiError, generateRequestId } from '../../../../lib/middleware/errorHandler';
import { updateProfileSchema } from '../../../../lib/schemas';
import { logger } from '../../../../lib/logger/Logger';
import { rateLimit } from '../../../../lib/rateLimit';

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();

  try {
    logger.info('POST /api/profile/update', { requestId });

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
