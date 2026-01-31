"use client";

import { motion } from 'framer-motion';
import { useTheme } from '../../lib/hooks/useTheme';

/**
 * Theme toggle button with animated sun/moon icon
 */
export default function ThemeToggle() {
    const { resolvedTheme, toggle } = useTheme();
    const isDark = resolvedTheme === 'dark';

    return (
        <motion.button
            onClick={toggle}
            className="relative p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            whileTap={{ scale: 0.95 }}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {/* Sun icon */}
            <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-amber-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                initial={false}
                animate={{
                    scale: isDark ? 0 : 1,
                    opacity: isDark ? 0 : 1,
                    rotate: isDark ? 90 : 0
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                style={{ position: 'absolute', top: '50%', left: '50%', marginTop: '-10px', marginLeft: '-10px' }}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
            </motion.svg>

            {/* Moon icon */}
            <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-violet-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                initial={false}
                animate={{
                    scale: isDark ? 1 : 0,
                    opacity: isDark ? 1 : 0,
                    rotate: isDark ? 0 : -90
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                style={{ position: isDark ? 'relative' : 'absolute', top: isDark ? undefined : '50%', left: isDark ? undefined : '50%', marginTop: isDark ? undefined : '-10px', marginLeft: isDark ? undefined : '-10px' }}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
            </motion.svg>

            {/* Invisible spacer for consistent button size */}
            {!isDark && (
                <div className="h-5 w-5 opacity-0">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" />
                </div>
            )}
        </motion.button>
    );
}
