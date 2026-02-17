import { NextRequest } from 'next/server';
import { supabaseAdmin } from './supabaseAdmin';
import { AppError } from './errors/AppError';

export interface AuthenticatedUser {
    id: string;
    email?: string;
    role?: string;
}

/**
 * securely retrieves the authenticated user from the request using Supabase Auth.
 * Expects 'Authorization: Bearer <token>' header.
 */
export async function getAuthenticatedUser(req: NextRequest): Promise<AuthenticatedUser> {
    const authHeader = req.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError('UNAUTHORIZED', 'Unauthorized: Missing or invalid Authorization header', 401);
    }

    const token = authHeader.split(' ')[1];

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
        throw new AppError('UNAUTHORIZED', 'Unauthorized: Invalid token', 401, { originalError: error?.message });
    }

    return {
        id: user.id,
        email: user.email,
        role: user.role
    };
}
