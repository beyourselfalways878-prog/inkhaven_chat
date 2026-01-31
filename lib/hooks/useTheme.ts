"use client";

import { useEffect, useState, useCallback } from 'react';

export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'inkhaven:theme';

/**
 * Hook for managing theme state with localStorage persistence
 * and system preference detection
 */
export function useTheme() {
    const [theme, setThemeState] = useState<Theme>('system');
    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

    // Get actual theme (resolving 'system' to light/dark)
    const resolveTheme = useCallback((themeValue: Theme): 'light' | 'dark' => {
        if (themeValue === 'system') {
            if (typeof window !== 'undefined') {
                return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }
            return 'light';
        }
        return themeValue;
    }, []);

    // Apply theme to document
    const applyTheme = useCallback((themeValue: Theme) => {
        if (typeof document === 'undefined') return;

        const resolved = resolveTheme(themeValue);
        const root = document.documentElement;

        // Remove existing theme attribute
        root.removeAttribute('data-theme');

        // Set new theme
        if (themeValue !== 'system') {
            root.setAttribute('data-theme', themeValue);
        }

        // Update meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', resolved === 'dark' ? '#0f172a' : '#ffffff');
        }

        setResolvedTheme(resolved);
    }, [resolveTheme]);

    // Set theme with persistence
    const setTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme);
        applyTheme(newTheme);

        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, newTheme);
        }
    }, [applyTheme]);

    // Toggle between light and dark
    const toggle = useCallback(() => {
        const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    }, [resolvedTheme, setTheme]);

    // Initialize theme on mount
    useEffect(() => {
        // Get saved theme or default to system
        const savedTheme = (typeof localStorage !== 'undefined'
            ? localStorage.getItem(STORAGE_KEY) as Theme | null
            : null) || 'system';

        setThemeState(savedTheme);
        applyTheme(savedTheme);
    }, [applyTheme]);

    // Listen for system preference changes
    useEffect(() => {
        if (typeof window === 'undefined' || theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = () => {
            setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    return {
        theme,
        resolvedTheme,
        setTheme,
        toggle,
        isDark: resolvedTheme === 'dark'
    };
}

export default useTheme;
