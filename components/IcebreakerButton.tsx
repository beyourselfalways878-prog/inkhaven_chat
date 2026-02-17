/* eslint-disable no-unused-vars */
"use client";

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ICEBREAKERS = [
    // Fun
    "If you could have any superpower for a day, what would it be?",
    "What's the most unusual food you've ever tried?",
    "If you were a pizza topping, what would you be?",
    "What's your go-to karaoke song?",
    "Desert island: pick 3 items",

    // Deep
    "What's something you believe that most people don't?",
    "If you could change one thing about the world, what would it be?",
    "What's the best piece of advice you've ever received?",
    "What would you tell your younger self?",
    "What does happiness mean to you?",

    // Getting to know
    "What's your current obsession?",
    "What show are you binging right now?",
    "Coffee or tea, and how do you take it?",
    "What's your dream travel destination?",
    "What skill would you love to master?",

    // Creative
    "You're hosting a dinner party with 3 famous people. Who's invited?",
    "What would be the title of your autobiography?",
    "If your life was a movie, what genre would it be?",
    "You can only listen to one artist forever. Who?",
    "What's something you're proud of that you don't often get to brag about?",
];

interface IcebreakerButtonProps {
    onSelect: (_icebreaker: string) => void;
    compact?: boolean;
}

export default function IcebreakerButton({ onSelect, compact = false }: IcebreakerButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentBreakers, setCurrentBreakers] = useState<string[]>([]);

    const shuffleBreakers = useCallback(() => {
        const shuffled = [...ICEBREAKERS].sort(() => Math.random() - 0.5);
        setCurrentBreakers(shuffled.slice(0, 3));
    }, []);

    const handleOpen = () => {
        shuffleBreakers();
        setIsOpen(true);
    };

    const handleSelect = (breaker: string) => {
        onSelect(breaker);
        setIsOpen(false);
    };

    return (
        <>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleOpen}
                className={`
          flex items-center gap-1 rounded-full transition-all
          ${compact ? 'p-2' : 'px-3 py-2 text-sm'}
          bg-gradient-to-r from-amber-500 to-orange-500 text-white
          shadow-md hover:shadow-lg
        `}
                title="Get conversation starter"
            >
                <span>🎲</span>
                {!compact && <span>Icebreaker</span>}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4"
                        >
                            <div
                                className="rounded-2xl overflow-hidden shadow-2xl"
                                style={{ background: 'var(--color-bg-primary)' }}
                            >
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                            <span>🎲</span> Icebreakers
                                        </h3>
                                        <button
                                            onClick={shuffleBreakers}
                                            className="text-sm px-3 py-1 rounded-full bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-secondary)] transition"
                                        >
                                            🔄 Shuffle
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        {currentBreakers.map((breaker, i) => (
                                            <motion.button
                                                key={breaker}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                onClick={() => handleSelect(breaker)}
                                                className="w-full p-4 text-left rounded-xl transition-all hover:scale-[1.02]"
                                                style={{ background: 'var(--color-bg-tertiary)' }}
                                            >
                                                {breaker}
                                            </motion.button>
                                        ))}
                                    </div>

                                    <p className="mt-4 text-xs text-center" style={{ color: 'var(--color-text-tertiary)' }}>
                                        Click to insert into your message
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
