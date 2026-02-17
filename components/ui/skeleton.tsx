'use client';

import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
    lines?: number;
}

/**
 * Shimmer skeleton loader for loading states.
 */
export function Skeleton({
    className = '',
    variant = 'rectangular',
    width,
    height,
    lines = 1,
}: SkeletonProps) {
    const baseClass = 'animate-pulse bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%] animate-shimmer';

    const variantClass = {
        text: 'rounded h-4',
        circular: 'rounded-full',
        rectangular: 'rounded-xl',
    }[variant];

    const style: React.CSSProperties = {
        width: width || '100%',
        height: height || (variant === 'text' ? '1rem' : variant === 'circular' ? width || '40px' : '100%'),
    };

    if (lines > 1) {
        return (
            <div className={`flex flex-col gap-2 ${className}`}>
                {Array.from({ length: lines }).map((_, i) => (
                    <div
                        key={i}
                        className={`${baseClass} ${variantClass}`}
                        style={{
                            ...style,
                            width: i === lines - 1 ? '75%' : '100%', // Last line shorter
                        }}
                    />
                ))}
            </div>
        );
    }

    return <div className={`${baseClass} ${variantClass} ${className}`} style={style} />;
}

/**
 * Message skeleton for chat loading state.
 */
export function MessageSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="flex flex-col gap-4 p-4">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className={`flex gap-3 ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}
                >
                    <Skeleton variant="circular" width={36} height={36} />
                    <div className={`flex flex-col gap-1.5 ${i % 2 === 0 ? '' : 'items-end'}`}>
                        <Skeleton variant="text" width={i % 3 === 0 ? 200 : i % 3 === 1 ? 280 : 160} />
                        {i % 2 === 0 && <Skeleton variant="text" width={120} />}
                    </div>
                </div>
            ))}
        </div>
    );
}
