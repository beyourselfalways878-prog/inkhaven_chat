import React from 'react';

/**
 * Ink Aura System — InkHaven's Unique Visual Identity
 *
 * Every user gets a living, evolving gradient aura. The aura is:
 * - Deterministic: same seed + reputation always produces the same colors
 * - Reputation-responsive: higher rep = more vibrant, richer hues
 * - Blendable: two users' auras can merge in a shared chat room
 *
 * No other chat app has this.
 */

// ============================================================================
// Color Generation
// ============================================================================

/**
 * HSL color from a seed value. Deterministic.
 */
function seedToHSL(seed: number, offset: number = 0): [number, number, number] {
    // Use golden ratio for well-distributed hue spreading
    const golden = 0.618033988749895;
    const hue = ((seed * golden + offset) % 1) * 360;
    return [hue, 70, 55];
}

/**
 * Adjust saturation and lightness based on reputation.
 * Higher reputation = more vivid and luminous.
 */
function reputationModify(
    hsl: [number, number, number],
    reputation: number
): [number, number, number] {
    const repNorm = Math.max(0, Math.min(100, reputation)) / 100;
    // Rep 0-30: muted/dim, Rep 50: balanced, Rep 80-100: vivid/bright
    const saturation = 30 + repNorm * 50; // 30% → 80%
    const lightness = 35 + repNorm * 25;   // 35% → 60%
    return [hsl[0], saturation, lightness];
}

function hslString(h: number, s: number, l: number): string {
    return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
}

// ============================================================================
// Aura Types
// ============================================================================

export interface AuraColors {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
}

export interface AuraBlend {
    gradient: string;
    colors: AuraColors;
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Generate a user's aura colors from their seed and reputation.
 */
export function generateAuraColors(seed: number, reputation: number = 50): AuraColors {
    const norm = seed / 1000000;

    const primary = reputationModify(seedToHSL(norm, 0), reputation);
    const secondary = reputationModify(seedToHSL(norm, 0.33), reputation);
    const accent = reputationModify(seedToHSL(norm, 0.66), reputation);

    // Glow is a brighter, more saturated version of primary
    const glow: [number, number, number] = [primary[0], Math.min(primary[1] + 20, 100), Math.min(primary[2] + 15, 85)];

    return {
        primary: hslString(...primary),
        secondary: hslString(...secondary),
        accent: hslString(...accent),
        glow: hslString(...glow),
    };
}

/**
 * Generate a CSS gradient string for an aura.
 */
export function generateAuraGradient(seed: number, reputation: number = 50): string {
    const colors = generateAuraColors(seed, reputation);
    return `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 50%, ${colors.accent} 100%)`;
}

/**
 * Generate a radial glow gradient (for backgrounds, orbs).
 */
export function generateAuraGlow(seed: number, reputation: number = 50): string {
    const colors = generateAuraColors(seed, reputation);
    return `radial-gradient(ellipse at center, ${colors.glow}40 0%, ${colors.primary}20 40%, transparent 70%)`;
}

/**
 * Blend two users' auras for a shared chat room.
 * The blend creates a new gradient that subtly combines both identities.
 */
export function blendAuras(
    seed1: number, rep1: number,
    seed2: number, rep2: number
): AuraBlend {
    const a1 = generateAuraColors(seed1, rep1);
    const a2 = generateAuraColors(seed2, rep2);

    return {
        gradient: `linear-gradient(135deg, ${a1.primary} 0%, ${a1.secondary} 25%, ${a2.secondary} 75%, ${a2.accent} 100%)`,
        colors: {
            primary: a1.primary,
            secondary: a1.secondary,
            accent: a2.accent,
            glow: a2.glow,
        },
    };
}

/**
 * Get a subtle background style for chat rooms based on blended auras.
 */
export function getChatRoomAuraStyle(
    seed1: number, rep1: number,
    seed2: number, rep2: number
): React.CSSProperties {
    const blend = blendAuras(seed1, rep1, seed2, rep2);
    return {
        background: `
      radial-gradient(ellipse at 10% 90%, ${blend.colors.primary}08 0%, transparent 50%),
      radial-gradient(ellipse at 90% 10%, ${blend.colors.accent}08 0%, transparent 50%)
    `,
    };
}

/**
 * Compute a "chemistry score" between two auras (0-100).
 * Based on hue complementarity — opposite hues have higher chemistry.
 */
export function computeChemistry(seed1: number, seed2: number): number {
    const golden = 0.618033988749895;
    const hue1 = ((seed1 / 1000000) * golden) * 360;
    const hue2 = ((seed2 / 1000000) * golden) * 360;
    const diff = Math.abs(hue1 - hue2);
    const complementarity = Math.abs(diff - 180) / 180;
    // 0 = exactly complementary (best), 1 = identical (worst)
    return Math.round((1 - complementarity) * 100);
}
// ============================================================================
// Resonance Physics (Typing Velocity & Sentiment)
// ============================================================================

/**
 * Calculate resonance modifiers based on typing intensity (0.0 - 1.0).
 * - 0.0 (Idle): Standard pulse, standard colors.
 * - 0.5 (Active): Brighter, slightly faster.
 * - 1.0 (Burn): "Afterburner" effect — intense saturation, rapid pulse, hue shift towards heat.
 */
export function getResonance(intensity: number): {
    saturationBoost: number;
    lightnessBoost: number;
    pulseDuration: number; // Seconds
    scale: number;
} {
    // Clamp intensity to 0-1
    const val = Math.max(0, Math.min(1, intensity));

    return {
        // Saturation goes up significantly
        saturationBoost: val * 40,
        // Lightness bumps up slightly to "glow"
        lightnessBoost: val * 15,
        // Pulse gets faster (4s idle -> 0.8s burn)
        pulseDuration: 4 - (val * 3.2),
        // Size grows slightly
        scale: 1 + (val * 0.15)
    };
}
