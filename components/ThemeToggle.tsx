"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    // useEffect only runs on the client, so now we can safely show the UI
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors opacity-50 cursor-default">
                <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 border-t-transparent animate-spin" />
            </button>
        );
    }

    const isDark = theme === "dark";

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group overflow-hidden"
            aria-label="Toggle theme"
        >
            <div className="absolute inset-0 bg-indigo-500/10 dark:bg-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            {isDark ? (
                <Sun className="h-[1.2rem] w-[1.2rem] text-slate-400 hover:text-indigo-400 transition-all rotate-0 scale-100 duration-500" />
            ) : (
                <Moon className="h-[1.2rem] w-[1.2rem] text-slate-500 hover:text-indigo-600 transition-all rotate-0 scale-100 duration-500" />
            )}
        </button>
    );
}
