"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type ModerationMode = 'safe' | 'adult';

interface ModerationGateProps {
    children: React.ReactNode;
}

const STORAGE_KEY = 'inkhaven:moderation_mode';
const CONSENT_KEY = 'inkhaven:moderation_consent';

export function getModerationMode(): ModerationMode {
    if (typeof window === 'undefined') return 'safe';
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'adult' ? 'adult' : 'safe';
}

export function hasGivenConsent(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(CONSENT_KEY) === 'true';
}

export function setModerationMode(mode: ModerationMode): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, mode);
    localStorage.setItem(CONSENT_KEY, 'true');
}

export default function ModerationGate({ children }: ModerationGateProps) {
    const [showModal, setShowModal] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!hasGivenConsent()) {
            setShowModal(true);
        }
    }, []);

    const handleSelectMode = (mode: ModerationMode) => {
        setModerationMode(mode);
        setShowModal(false);
    };

    if (!mounted) return null;

    return (
        <>
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-lg mx-4 rounded-3xl overflow-hidden shadow-2xl"
                            style={{ background: 'var(--color-bg-primary)' }}
                        >
                            {/* Header */}
                            <div className="px-8 pt-8 pb-4 text-center">
                                <div className="text-4xl mb-3">🎭</div>
                                <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                                    Welcome to InkHaven
                                </h2>
                                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                    Choose your experience to continue
                                </p>
                            </div>

                            {/* Options */}
                            <div className="px-8 py-6 space-y-4">
                                {/* Safe Mode */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleSelectMode('safe')}
                                    className="w-full p-6 rounded-2xl text-left transition-all border-2 border-transparent hover:border-emerald-500"
                                    style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)' }}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="text-3xl">🛡️</div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
                                                Safe Mode
                                            </h3>
                                            <ul className="text-sm space-y-1" style={{ color: 'var(--color-text-secondary)' }}>
                                                <li>• No adult or explicit content</li>
                                                <li>• Strict AI moderation</li>
                                                <li>• Family-friendly conversations</li>
                                                <li>• Instant blocking of inappropriate users</li>
                                            </ul>
                                        </div>
                                        <div className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                                            Recommended
                                        </div>
                                    </div>
                                </motion.button>

                                {/* Adult Mode */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleSelectMode('adult')}
                                    className="w-full p-6 rounded-2xl text-left transition-all border-2 border-transparent hover:border-amber-500"
                                    style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)' }}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="text-3xl">🔞</div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-amber-600 dark:text-amber-400 mb-1">
                                                18+ Mode
                                            </h3>
                                            <ul className="text-sm space-y-1" style={{ color: 'var(--color-text-secondary)' }}>
                                                <li>• Age verification required</li>
                                                <li>• Adult conversations allowed</li>
                                                <li>• Standard content moderation</li>
                                                <li>• User-reported content review</li>
                                            </ul>
                                        </div>
                                        <div className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-600 dark:text-amber-400">
                                            18+ Only
                                        </div>
                                    </div>
                                </motion.button>
                            </div>

                            {/* Disclaimer */}
                            <div className="px-8 pb-8">
                                <div className="p-4 rounded-xl text-xs" style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-tertiary)' }}>
                                    <p className="mb-2">
                                        <strong>⚠️ Important Notice:</strong>
                                    </p>
                                    <p className="mb-2">
                                        By selecting 18+ Mode, you confirm that you are at least 18 years of age and legally permitted to view adult content in your jurisdiction.
                                    </p>
                                    <p>
                                        Both modes are subject to our{' '}
                                        <a href="/legal/terms" className="underline hover:text-[var(--color-accent-primary)]">Terms of Service</a>
                                        {' '}and{' '}
                                        <a href="/legal/privacy" className="underline hover:text-[var(--color-accent-primary)]">Privacy Policy</a>.
                                        Harassment, illegal content, and abuse are never tolerated.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {children}
        </>
    );
}
