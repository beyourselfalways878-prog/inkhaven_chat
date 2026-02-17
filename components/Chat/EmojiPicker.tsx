'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, Search } from 'lucide-react';

// ============================================================================
// Emoji Data — Organized by category
// ============================================================================

const EMOJI_CATEGORIES: Record<string, string[]> = {
    'Smileys': ['😀', '😃', '😄', '😁', '😊', '🥰', '😍', '🤩', '😘', '😜', '🤪', '😎', '🤓', '🥳', '😌', '😏', '🤔', '🤗', '😬', '😮', '😯', '😲', '🤯', '😴', '🥱', '😷', '🤢', '🤮', '😵', '🤠'],
    'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '❤️‍🔥', '💯', '✨', '💫'],
    'Hands': ['👋', '🤚', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👍', '👎', '👏', '🙌', '🫶', '🤝', '🫡'],
    'Animals': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🦋', '🌸'],
    'Food': ['🍕', '🍔', '🌮', '🍜', '🍣', '🍱', '🍩', '🍪', '🍰', '☕', '🍵', '🧋', '🍺', '🍷', '🥂', '🍿', '🧁', '🍫', '🍬', '🍭'],
    'Activity': ['⚡', '🔥', '🎉', '🎊', '🎈', '🎯', '🎮', '🎲', '🎵', '🎶', '🏆', '🥇', '🏅', '⭐', '🌟', '💪', '🏃', '🧘', '🎨', '📸'],
    'Objects': ['💡', '📱', '💻', '⌨️', '🎧', '📚', '📝', '✏️', '📌', '🔗', '💎', '🔔', '🎁', '📦', '🚀', '✈️', '🌍', '🏠', '⏰', '🔑'],
};

const ALL_EMOJIS = Object.values(EMOJI_CATEGORIES).flat();

// ============================================================================
// Component
// ============================================================================

interface EmojiPickerProps {
    open: boolean;
    onClose: () => void;
    onSelect: (emoji: string) => void; // eslint-disable-line no-unused-vars
    position?: 'top' | 'bottom';
}

export function EmojiPicker({ open, onClose, onSelect, position = 'top' }: EmojiPickerProps) {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('Smileys');
    const ref = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open, onClose]);

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose]);

    const handleSelect = (emoji: string) => {
        onSelect(emoji);
        onClose();
    };

    const displayEmojis = search
        ? ALL_EMOJIS.filter(() => true) // Can't search emoji by text easily; show all when typing
        : EMOJI_CATEGORIES[activeCategory] || [];

    const positionClass = position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2';

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, scale: 0.9, y: position === 'top' ? 10 : -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: position === 'top' ? 10 : -10 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute ${positionClass} left-0 z-50 w-[320px] rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl overflow-hidden`}
                >
                    {/* Search */}
                    <div className="p-2 border-b border-white/5">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" size={14} />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search emoji..."
                                className="w-full bg-white/5 rounded-lg pl-8 pr-3 py-1.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Category tabs */}
                    {!search && (
                        <div className="flex gap-0.5 px-2 py-1.5 border-b border-white/5 overflow-x-auto scrollbar-hide">
                            {Object.keys(EMOJI_CATEGORIES).map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`
                    px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors
                    ${activeCategory === cat
                                            ? 'bg-indigo-500/20 text-indigo-300'
                                            : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                                        }
                  `}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Emoji grid */}
                    <div className="grid grid-cols-8 gap-0.5 p-2 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                        {displayEmojis.map((emoji, i) => (
                            <button
                                key={`${emoji}-${i}`}
                                onClick={() => handleSelect(emoji)}
                                className="w-9 h-9 flex items-center justify-center rounded-lg text-xl hover:bg-white/10 transition-colors active:scale-90"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ============================================================================
// Emoji Toggle Button (for MessageInput)
// ============================================================================

interface EmojiToggleProps {
    onSelect: (emoji: string) => void; // eslint-disable-line no-unused-vars
}

export function EmojiToggle({ onSelect }: EmojiToggleProps) {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={`
          p-2 rounded-xl transition-colors
          ${open
                        ? 'bg-indigo-500/20 text-indigo-400'
                        : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                    }
        `}
            >
                <Smile size={20} />
            </button>
            <EmojiPicker
                open={open}
                onClose={() => setOpen(false)}
                onSelect={onSelect}
                position="top"
            />
        </div>
    );
}
