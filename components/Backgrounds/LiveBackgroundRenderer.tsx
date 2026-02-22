"use client";

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useSessionStore } from '../../stores/useSessionStore';
// Theme Components
import GalacticTheme from './themes/GalacticTheme';
import RainTheme from './themes/RainTheme';

export default function LiveBackgroundRenderer() {
    const { session } = useSessionStore();
    const activeTheme = session.backgroundTheme || 'aurora'; // default to standard aurora if none selected

    if (activeTheme === 'none' || activeTheme === 'aurora') {
        return null; // Return nothing, let CSS handle it
    }

    return (
        <div className="fixed inset-0 z-0 pointer-events-none opacity-50 dark:opacity-40">
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }} gl={{ alpha: true, antialias: false }}>
                <Suspense fallback={null}>
                    {activeTheme === 'galactic' && <GalacticTheme />}
                    {activeTheme === 'rain' && <RainTheme />}
                </Suspense>
            </Canvas>
        </div>
    );
}
