"use client";

import React, { useState } from 'react';
import { useSessionStore } from '../../stores/useSessionStore';
import { Settings, Sparkles, CloudRain, Image as ImageIcon } from 'lucide-react';

export default function BackgroundThemeSelector() {
    const { session, setSession } = useSessionStore();
    const currentTheme = session.backgroundTheme || 'aurora';
    const [isOpen, setIsOpen] = useState(false);

    const setTheme = (theme: 'aurora' | 'galactic' | 'rain' | 'none') => {
        setSession({ ...session, backgroundTheme: theme });
        setIsOpen(false);
    };

    const themes = [
        { id: 'aurora', name: 'Aurora (Default)', icon: ImageIcon },
        { id: 'galactic', name: 'Galactic Voyager', icon: Sparkles },
        { id: 'rain', name: 'Midnight Rain', icon: CloudRain },
        { id: 'none', name: 'None (Minimal)', icon: Settings }, // Basic fallback icon
    ] as const;

    const currentThemeData = themes.find(t => t.id === currentTheme) || themes[0];
    const CurrentIcon = currentThemeData.icon;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-xs text-slate-600 dark:text-slate-300 font-medium"
                title="Background Theme"
            >
                <CurrentIcon size={14} className="text-indigo-400" />
                <span className="hidden sm:inline">{currentThemeData.name}</span>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                        <div className="p-2 space-y-1">
                            {themes.map((theme) => {
                                const Icon = theme.icon;
                                const isActive = currentTheme === theme.id;
                                return (
                                    <button
                                        key={theme.id}
                                        onClick={() => setTheme(theme.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${isActive
                                            ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                                            }`}
                                    >
                                        <Icon size={14} className={isActive ? 'text-indigo-500' : 'text-slate-400'} />
                                        {theme.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
