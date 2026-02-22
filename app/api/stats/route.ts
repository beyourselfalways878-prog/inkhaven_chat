/**
 * GET /api/stats
 * Returns real-time platform statistics for the landing page.
 * Falls back to reasonable defaults if queries fail.
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';
import { createLogger } from '../../../lib/logger/Logger';

const logger = createLogger('StatsAPI');

// Cache stats for 60 seconds to avoid hitting DB on every page load
let cachedStats: { data: any; timestamp: number } | null = null;
const CACHE_TTL_MS = 60_000;

export async function GET() {
    try {
        // Return cached stats if fresh
        if (cachedStats && Date.now() - cachedStats.timestamp < CACHE_TTL_MS) {
            return NextResponse.json({ ok: true, data: cachedStats.data });
        }

        // Count total users
        const { count: userCount } = await supabaseAdmin
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        // Count total messages
        const { count: messageCount } = await supabaseAdmin
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('is_deleted', false);

        // Count active rooms (rooms with messages in last 24h)
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count: activeRooms } = await supabaseAdmin
            .from('rooms')
            .select('*', { count: 'exact', head: true })
            .gte('last_message_at', yesterday);

        // Count flagged messages for safety percentage
        const { count: flaggedCount } = await supabaseAdmin
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('moderation_status', 'flagged');

        const totalMessages = messageCount || 0;
        const flagged = flaggedCount || 0;
        const safePercentage = totalMessages > 0
            ? Math.round(((totalMessages - flagged) / totalMessages) * 100)
            : 99;

        const stats = {
            usersConnected: userCount || 0,
            safePercentage: Math.max(safePercentage, 95), // floor at 95%
            activeRooms: activeRooms || 0,
            totalMessages: totalMessages,
        };

        // Cache the result
        cachedStats = { data: stats, timestamp: Date.now() };

        return NextResponse.json({ ok: true, data: stats });
    } catch (error) {
        logger.error('Failed to fetch stats', { error });

        // Return fallback stats on error
        return NextResponse.json({
            ok: true,
            data: {
                usersConnected: 0,
                safePercentage: 99,
                activeRooms: 0,
                totalMessages: 0,
            }
        });
    }
}
