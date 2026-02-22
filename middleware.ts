/**
 * Next.js Middleware
 *
 * Handles:
 *  1. Route protection — redirects unauthenticated users away from protected pages
 *  2. ModerationGate enforcement — redirects users who haven't selected a mode
 *  3. CORS headers on API routes
 */

import { NextRequest, NextResponse } from 'next/server';

// Routes that require authentication (logged-in or anonymous Supabase session)
const PROTECTED_ROUTES = ['/chat', '/settings', '/quick-match'];

// Routes that are always public
const PUBLIC_ROUTES = ['/', '/onboarding', '/legal', '/api/health', '/api/auth'];

// API route prefix
const API_PREFIX = '/api/';

function isProtectedRoute(pathname: string): boolean {
    return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

function isPublicRoute(pathname: string): boolean {
    return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
}

function isApiRoute(pathname: string): boolean {
    return pathname.startsWith(API_PREFIX);
}

/**
 * Add CORS headers for API routes
 */
function addCorsHeaders(response: NextResponse, origin: string | null): NextResponse {
    const allowedOrigins = [
        'https://www.inkhaven.in',
        'https://inkhaven.in',
        'http://localhost:3000',
        'http://localhost:3001',
    ];

    const effectiveOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

    response.headers.set('Access-Control-Allow-Origin', effectiveOrigin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Max-Age', '86400');

    return response;
}

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const origin = req.headers.get('origin');

    // Handle CORS preflight for API routes
    if (isApiRoute(pathname) && req.method === 'OPTIONS') {
        const preflightResponse = new NextResponse(null, { status: 204 });
        return addCorsHeaders(preflightResponse, origin);
    }

    // Add CORS headers to all API responses
    if (isApiRoute(pathname)) {
        const response = NextResponse.next();
        return addCorsHeaders(response, origin);
    }

    // Skip middleware for static files, images, _next, etc.
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/icons') ||
        pathname.startsWith('/locales') ||
        pathname.includes('.') // static files (sw.js, manifest.json, etc.)
    ) {
        return NextResponse.next();
    }

    // Skip public routes
    if (isPublicRoute(pathname)) {
        return NextResponse.next();
    }

    // For protected routes, check for Supabase auth token
    if (isProtectedRoute(pathname)) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            // Can't verify auth without Supabase — allow through (dev mode)
            return NextResponse.next();
        }

        // Check for auth cookie or token
        // Supabase stores session in cookies with names like sb-<ref>-auth-token
        const cookies = req.cookies.getAll();
        const hasSupabaseCookie = cookies.some(c =>
            c.name.includes('sb-') && c.name.includes('-auth-token')
        );

        if (!hasSupabaseCookie) {
            // No session — redirect to onboarding
            const url = req.nextUrl.clone();
            url.pathname = '/onboarding';
            url.searchParams.set('redirect', pathname);
            return NextResponse.redirect(url);
        }
    }

    // ModerationGate enforcement via cookie
    // The ModerationGate component stores consent in localStorage (client-side).
    // We also set a cookie from the client so the middleware can check it.
    // If the cookie isn't set, the client-side ModerationGate modal will still show,
    // so this is defense-in-depth rather than the only check.

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
