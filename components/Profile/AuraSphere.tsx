'use client';

import React, { useEffect, useState } from 'react';

interface AuraSphereProps {
    inkId: string;
    comfortLevel?: 'gentle' | 'balanced' | 'bold';
    isPulsing?: boolean;
    size?: 'sm' | 'md' | 'lg' | 'hero';
}

export default function AuraSphere({ inkId, comfortLevel = 'balanced', isPulsing = false, size = 'md' }: AuraSphereProps) {
    const [hue, setHue] = useState(0);

    useEffect(() => {
        // Generate a deterministic color offset based on the inkId string
        let hash = 0;
        for (let i = 0; i < inkId.length; i++) {
            hash = inkId.charCodeAt(i) + ((hash << 5) - hash);
        }
        // Modulo 360 to get a valid HSL hue
        setHue(Math.abs(hash % 360));
    }, [inkId]);

    const sizeClasses = {
        sm: 'w-12 h-12',
        md: 'w-24 h-24',
        lg: 'w-32 h-32',
        hero: 'w-48 h-48 md:w-64 md:h-64'
    };

    // Adjust saturation and lightness based on Comfort Level
    const s = comfortLevel === 'gentle' ? '50%' : comfortLevel === 'bold' ? '90%' : '70%';
    const l = comfortLevel === 'gentle' ? '70%' : comfortLevel === 'bold' ? '50%' : '60%';

    const pulseClass = isPulsing ? 'animate-pulse-glow' : 'animate-float';

    return (
        <div className={`relative ${sizeClasses[size]}`}>
            {/* Background Glow */}
            <div
                className={`absolute inset-0 rounded-full blur-2xl opacity-40 transition-all duration-1000 ${pulseClass}`}
                style={{ background: `hsl(${hue}, ${s}, ${l})` }}
            />

            {/* The Physical Sphere */}
            <div
                className={`absolute inset-0 rounded-full backdrop-blur-xl border border-white/20 shadow-[inset_0_-10px_30px_rgba(0,0,0,0.5),inset_0_10px_30px_rgba(255,255,255,0.3)] flex items-center justify-center overflow-hidden transition-all duration-700 hover:scale-105`}
                style={{
                    background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 40%), linear-gradient(135deg, hsl(${hue}, ${s}, ${l}, 0.5) 0%, hsl(${hue}, ${s}, 20%, 0.8) 100%)`
                }}
            >
                {/* Inner energetic core */}
                <div
                    className="w-1/2 h-1/2 rounded-full blur-md opacity-60 mix-blend-screen animate-pulse"
                    style={{ background: `hsl(${hue + 40}, 100%, 70%)` }}
                />
            </div>
        </div>
    );
}
