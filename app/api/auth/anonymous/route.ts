/**
 * POST /api/auth/anonymous
 * Create anonymous user session
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { handleApiError, generateRequestId } from '../../../../lib/middleware/errorHandler';
import { logger } from '../../../../lib/logger/Logger';
import { rateLimitPersistent } from '../../../../lib/rateLimitPersistent';
import { profileService } from '../../../../lib/services/ProfileService';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();

  try {
    logger.info('POST /api/auth/anonymous', { requestId });

    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') ?? 'local';
    const limit = await rateLimitPersistent(`auth:anonymous:${ip}`, 20, 60);

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

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        {
          ok: false,
          error: 'INTERNAL_SERVER_ERROR',
          message: 'Service not configured',
          statusCode: 500
        },
        { status: 500 }
      );
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Create anonymous user
    const password = crypto.randomBytes(32).toString('hex');
    const { data, error } = await admin.auth.admin.createUser({
      email: `anon_${crypto.randomUUID()}@inkhaven.local`,
      password: password,
      email_confirm: true
    });

    if (error || !data?.user) {
      throw new Error('Failed to create user');
    }

    const user = data.user;

    // Create profile
    const profile = await profileService.createProfile(user.id);

    logger.info('Anonymous user created successfully', { requestId, userId: user.id });

    return NextResponse.json(
      {
        ok: true,
        data: {
          user: {
            id: user.id,
            email: user.email
          },
          profile
        }
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Failed to create anonymous user', { requestId, error });
    return handleApiError(error, requestId);
  }
}
