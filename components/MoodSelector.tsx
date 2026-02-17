/* eslint-disable no-unused-vars */
"use client";

import React from 'react';
import { motion } from 'framer-motion';

export type Mood = 'chill' | 'deep' | 'fun' | 'vent' | 'curious';

interface MoodSelectorProps {
    value: Mood | null;
    onChange: (_mood: Mood) => void;
    compact?: boolean;
}

const moods: { id: Mood; emoji: string; label: string; description: string; color: string }[] = [
    { id: 'chill', emoji: '😌', label: 'Chill', description: 'Relaxed vibes', color: 'bg-emerald-500' },
    { id: 'deep', emoji: '🌊', label: 'Deep', description: 'Meaningful talks', color: 'bg-indigo-500' },
    { id: 'fun', emoji: '🎉', label: 'Fun', description: 'Games & jokes', color: 'bg-amber-500' },
    { id: 'vent', emoji: '💭', label: 'Vent', description: 'Need to talk', color: 'bg-rose-500' },
    { id: 'curious', emoji: '🔮', label: 'Curious', description: 'Explore ideas', color: 'bg-purple-500' },
];

export default function MoodSelector({ value, onChange, compact = false }: MoodSelectorProps) {
    return (
        <div className={`grid ${compact ? 'grid-cols-5 gap-2' : 'grid-cols-5 gap-3'}`}>
            {moods.map((mood) => {
                const isSelected = value === mood.id;
                return (
                    <motion.button
                        key={mood.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onChange(mood.id)}
                        className={`
              relative flex flex-col items-center justify-center rounded-2xl transition-all
              ${compact ? 'p-3' : 'p-4'}
              ${isSelected
                                ? `${mood.color} text-white shadow-lg ring-2 ring-white/50`
                                : 'bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-secondary)]'
                            }
            `}
                    >
                        <span className={`${compact ? 'text-2xl' : 'text-3xl'} mb-1`}>{mood.emoji}</span>
                        <span className={`font-medium ${compact ? 'text-xs' : 'text-sm'}`}>{mood.label}</span>
                        {!compact && (
                            <span className={`text-xs mt-0.5 opacity-70 ${isSelected ? 'text-white' : 'text-[var(--color-text-tertiary)]'}`}>
                                {mood.description}
                            </span>
                        )}

                        {/* Glow effect when selected */}
                        {isSelected && (
                            <motion.div
                                layoutId="mood-glow"
                                className={`absolute inset-0 rounded-2xl ${mood.color} blur-xl opacity-30`}
                                initial={false}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            />
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
}

export function getMoodEmoji(mood: Mood): string {
    return moods.find(m => m.id === mood)?.emoji || '😌';
}

export function getMoodLabel(mood: Mood): string {
    return moods.find(m => m.id === mood)?.label || 'Chill';
}
