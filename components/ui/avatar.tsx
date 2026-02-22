'use client';

import React from 'react';
import { generateAuraGradient } from '../../lib/aura';

interface AvatarProps {
    userId?: string;
    displayName?: string;
    reputation?: number;
    auraSeed?: number;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    showStatus?: boolean;
    status?: 'online' | 'away' | 'offline';
    className?: string;
}

const sizeConfig = {
    xs: { container: 'w-6 h-6', text: 'text-[10px]', dot: 'w-1.5 h-1.5' },
    sm: { container: 'w-8 h-8', text: 'text-xs', dot: 'w-2 h-2' },
    md: { container: 'w-10 h-10', text: 'text-sm', dot: 'w-2.5 h-2.5' },
    lg: { container: 'w-14 h-14', text: 'text-lg', dot: 'w-3 h-3' },
    xl: { container: 'w-20 h-20', text: 'text-2xl', dot: 'w-4 h-4' },
};

const statusColors = {
    online: 'bg-emerald-400',
    away: 'bg-amber-400',
    offline: 'bg-slate-500',
};

/**
 * Avatar with Ink Aura gradient — unique to InkHaven.
 * Each user's avatar is a living gradient derived from their reputation and aura seed.
 */
export function Avatar({
    userId,
    displayName,
    reputation = 50,
    auraSeed,
    size = 'md',
    showStatus = false,
    status = 'offline',
    className = '',
}: AvatarProps) {
    const config = sizeConfig[size];
    const seed = auraSeed ?? (userId ? hashCode(userId) : 0);
    const gradient = generateAuraGradient(seed, reputation);
    const initial = displayName ? displayName[0].toUpperCase() : '?';

    return (
        <div className={`relative inline-flex ${className}`}>
            <div
                className={`
          ${config.container} rounded-full flex items-center justify-center
           font-bold text-white shadow-lg ring-2 ring-slate-200 dark:ring-white/10
        `}
                style={{ background: gradient }}
                title={displayName || 'Anonymous'}
            >
                <span className={`${config.text} select-none drop-shadow-sm`}>{initial}</span>
            </div>
            {showStatus && (
                <span
                    className={`
            absolute bottom-0 right-0 ${config.dot} rounded-full
             ${statusColors[status]} ring-2 ring-white dark:ring-slate-900
          `}
                />
            )}
        </div>
    );
}

// Simple hash function for deterministic seed from userId
function hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return Math.abs(hash);
}
