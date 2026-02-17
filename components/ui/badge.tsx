'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
    'inline-flex items-center gap-1 rounded-full text-xs font-medium transition-colors',
    {
        variants: {
            variant: {
                default: 'bg-white/10 text-white/70 border border-white/10',
                success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
                warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
                error: 'bg-red-500/15 text-red-400 border border-red-500/20',
                info: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
                premium: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/20',
                karma: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/20',
            },
            size: {
                sm: 'px-2 py-0.5 text-[10px]',
                md: 'px-2.5 py-1 text-xs',
                lg: 'px-3 py-1.5 text-sm',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'md',
        },
    }
);

interface BadgeProps extends VariantProps<typeof badgeVariants> {
    children: React.ReactNode;
    icon?: React.ReactNode;
    className?: string;
}

/**
 * Status and karma badges with variants.
 */
export function Badge({ children, variant, size, icon, className = '' }: BadgeProps) {
    return (
        <span className={`${badgeVariants({ variant, size })} ${className}`}>
            {icon && <span className="flex-shrink-0">{icon}</span>}
            {children}
        </span>
    );
}

/**
 * Karma-specific badge that shows reputation tier.
 */
export function KarmaLevel({ reputation = 50 }: { reputation?: number }) {
    const tier = reputation >= 80 ? 'Luminary'
        : reputation >= 60 ? 'Radiant'
            : reputation >= 40 ? 'Steady'
                : reputation >= 20 ? 'Spark'
                    : 'New';

    const variant = reputation >= 60 ? 'karma' : reputation >= 40 ? 'default' : 'warning';

    return (
        <Badge variant={variant as any} size="sm">
            ✦ {tier} ({reputation})
        </Badge>
    );
}
