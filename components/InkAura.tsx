'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { generateAuraColors, generateAuraGlow, computeChemistry, getResonance, blendAuras } from '../lib/aura';

// ... interface ...
interface InkAuraProps {
    seed: number;
    reputation?: number;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    animate?: boolean;
    className?: string;
    intensity?: number; // 0.0 - 1.0 (Typing velocity)
}

const sizeMap = {
    sm: { container: 'w-16 h-16', blur: '20px' },
    md: { container: 'w-24 h-24', blur: '30px' },
    lg: { container: 'w-36 h-36', blur: '40px' },
    xl: { container: 'w-48 h-48', blur: '50px' },
};

// ... component ...
export function InkAura({ seed, reputation = 50, size = 'md', animate = true, className = '', intensity = 0 }: InkAuraProps) {
    const colors = generateAuraColors(seed, reputation);
    const config = sizeMap[size];

    // Physics from Aura engine
    const physics = getResonance(intensity);

    return (
        <div className={`relative ${config.container} ${className}`}>
            {/* Glow layer */}
            <motion.div
                className="absolute inset-0 rounded-full opacity-60"
                style={{
                    background: generateAuraGlow(seed, reputation),
                    filter: `blur(${config.blur})`,
                }}
                animate={animate ? {
                    scale: [1 * physics.scale, 1.1 * physics.scale, 1 * physics.scale],
                    opacity: [0.4 + (intensity * 0.2), 0.6 + (intensity * 0.3), 0.4 + (intensity * 0.2)],
                } : undefined}
                transition={animate ? {
                    duration: physics.pulseDuration,
                    repeat: Infinity,
                    ease: 'easeInOut',
                } : undefined}
            />
            {/* Core orb */}
            <motion.div
                className="absolute inset-2 rounded-full"
                style={{
                    background: `conic-gradient(from 0deg, ${colors.primary}, ${colors.secondary}, ${colors.accent}, ${colors.primary})`,
                    filter: `saturate(${100 + physics.saturationBoost}%) brightness(${100 + physics.lightnessBoost}%)`
                }}
                animate={animate ? {
                    rotate: [0, 360],
                } : undefined}
                transition={animate ? {
                    duration: 20 - (intensity * 10), // Spin faster on high intensity
                    repeat: Infinity,
                    ease: 'linear',
                } : undefined}
            />
            {/* Inner highlight */}
            <div
                className="absolute inset-4 rounded-full"
                style={{
                    background: `radial-gradient(circle at 35% 35%, ${colors.glow}60 0%, transparent 60%)`,
                }}
            />
        </div>
    );
}

// ============================================================================
// Chemistry Meter — Shows compatibility between two users
// ============================================================================

interface ChemistryMeterProps {
    seed1: number;
    seed2: number;
    showLabel?: boolean;
    className?: string;
}

/**
 * Visual chemistry indicator between two matched users.
 */
export function ChemistryMeter({ seed1, seed2, showLabel = true, className = '' }: ChemistryMeterProps) {
    const score = computeChemistry(seed1, seed2);
    const colors1 = generateAuraColors(seed1);
    const colors2 = generateAuraColors(seed2);

    const label = score >= 80 ? 'Soulful'
        : score >= 60 ? 'Vibrant'
            : score >= 40 ? 'Warm'
                : score >= 20 ? 'Curious'
                    : 'Fresh';

    return (
        <div className={`flex flex-col items-center gap-2 ${className}`}>
            {showLabel && (
                <div className="text-xs font-medium text-white/50">
                    Vibe Chemistry: <span className="text-white/80">{label}</span>
                </div>
            )}
            <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                    className="h-full rounded-full"
                    style={{
                        background: `linear-gradient(90deg, ${colors1.primary}, ${colors2.accent})`,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                />
            </div>
            <span className="text-[10px] text-white/40">{score}%</span>
        </div>
    );
}

// ============================================================================
// Aura Blend Background — For chat rooms
// ============================================================================

// ... interface ...
interface AuraBlendBackgroundProps {
    seed1: number;
    rep1?: number;
    seed2: number;
    rep2?: number;
    children: React.ReactNode;
    className?: string;
    intensity?: number;
}

/**
 * Wraps chat content with a subtle aura-blended ambient background.
 */
export function AuraBlendBackground({
    seed1, rep1 = 50, seed2, rep2 = 50,
    children, className = '', intensity = 0
}: AuraBlendBackgroundProps) {
    const blend = blendAuras(seed1, rep1, seed2, rep2);
    const physics = getResonance(intensity);

    return (
        <div className={`relative ${className}`}>
            {/* Ambient aura gradients */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: `
            radial-gradient(ellipse at 5% 95%, ${blend.colors.primary} 0%, transparent 60%),
            radial-gradient(ellipse at 95% 5%, ${blend.colors.accent} 0%, transparent 60%)
          `,
                }}
                animate={{
                    opacity: [0.03 + (intensity * 0.05), 0.05 + (intensity * 0.08), 0.03 + (intensity * 0.05)],
                    scale: [1, 1.05 + (intensity * 0.02), 1],
                }}
                transition={{
                    duration: physics.pulseDuration * 1.5, // Slower ambient pulse
                    repeat: Infinity,
                    ease: 'easeInOut'
                }}
            />
            {children}
        </div>
    );
}
