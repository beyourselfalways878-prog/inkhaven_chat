"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface KarmaBadgeProps {
    karma: number;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

type KarmaTier = 'newcomer' | 'trusted' | 'veteran' | 'legend';

function getKarmaTier(karma: number): { tier: KarmaTier; label: string; color: string; emoji: string } {
    if (karma >= 500) return { tier: 'legend', label: 'Legend', color: 'text-amber-500', emoji: '👑' };
    if (karma >= 200) return { tier: 'veteran', label: 'Veteran', color: 'text-purple-500', emoji: '⭐' };
    if (karma >= 50) return { tier: 'trusted', label: 'Trusted', color: 'text-emerald-500', emoji: '✓' };
    return { tier: 'newcomer', label: 'Newcomer', color: 'text-slate-400', emoji: '○' };
}

export default function KarmaBadge({ karma, size = 'md', showLabel = true }: KarmaBadgeProps) {
    const { label, color, emoji } = getKarmaTier(karma);

    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-1.5'
    };

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`
        inline-flex items-center gap-1 rounded-full font-medium
        ${sizeClasses[size]}
        bg-[var(--color-bg-tertiary)]
        ${color}
      `}
        >
            <span>{emoji}</span>
            {showLabel && <span>{label}</span>}
            <span className="opacity-60">·</span>
            <span>{karma}</span>
        </motion.div>
    );
}

// Hook to manage karma
export function useKarma() {
    const [karma, setKarma] = useState(0);

    useEffect(() => {
        const stored = localStorage.getItem('inkhaven:karma');
        if (stored) {
            setKarma(parseInt(stored, 10) || 0);
        }
    }, []);

    const addKarma = (amount: number) => {
        setKarma((prev) => {
            const newValue = Math.max(0, prev + amount);
            localStorage.setItem('inkhaven:karma', String(newValue));
            return newValue;
        });
    };

    return { karma, addKarma, tier: getKarmaTier(karma) };
}

// Karma event types
export const KARMA_EVENTS = {
    CHAT_COMPLETE: 5,       // Completed 5+ minute conversation
    POSITIVE_REACTION: 2,   // Received positive reaction
    REPORT_VERIFIED: 5,     // Reported someone who got banned
    EARLY_LEAVE: -1,        // Left within 30 seconds
    GOT_REPORTED: -20,      // Got reported and verified
    DAILY_LOGIN: 1,         // Daily login bonus
} as const;
