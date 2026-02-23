"use client";

import React, { useEffect, useState } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { useSessionStore } from '../stores/useSessionStore';
import Link from 'next/link';

export default function AdBlockDetector({ children }: { children: React.ReactNode }) {
    const [hasAdblock, setHasAdblock] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const isPremium = useSessionStore((s) => s.session.isPremium);

    useEffect(() => {
        // If user is premium, completely bypass the check
        if (isPremium) {
            setIsChecking(false);
            setHasAdblock(false);
            return;
        }

        const checkAdBlocker = async () => {
            let isBlocked = false;

            // Method 1: Check if the global googletag/adsbygoogle object was injected but blocked
            try {
                // Create a bait request to a known ad-serving domain
                const response = await fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', {
                    method: 'HEAD',
                    mode: 'no-cors',
                    cache: 'no-store'
                });

                // no-cors always returns an opaque response with type 'opaque' and status 0.
                // If it throws, the network request was actively blocked by an extension.
            } catch (e) {
                isBlocked = true;
            }

            // Method 2: Create a generic bait element with typical ad classes
            if (!isBlocked) {
                const bait = document.createElement('div');
                bait.className = 'ad-banner ads adbox doubleclick sponsor';
                bait.style.position = 'absolute';
                bait.style.left = '-9999px';
                bait.style.height = '10px';
                bait.style.width = '10px';
                document.body.appendChild(bait);

                // Wait a frame for the adblocker to potentially hide it
                await new Promise(resolve => setTimeout(resolve, 50));

                // Check if the element was hidden by CSS injection from the adblocker
                if (bait.offsetHeight === 0 || window.getComputedStyle(bait).display === 'none') {
                    isBlocked = true;
                }

                document.body.removeChild(bait);
            }

            setHasAdblock(isBlocked);
            setIsChecking(false);
        };

        // Slight delay to allow adblock extensions to initialize
        const timer = setTimeout(() => {
            checkAdBlocker();
        }, 500);

        return () => clearTimeout(timer);
    }, [isPremium]);

    if (isChecking) {
        return <>{children}</>; // Render normally while checking
    }

    if (hasAdblock && !isPremium) {
        return (
            <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md p-6 animate-in fade-in duration-500">
                <div className="bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-white/10 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl relative overflow-hidden">

                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500" />

                    <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                        <ShieldAlert className="w-8 h-8 text-red-500" />
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                        AdBlock Detected
                    </h2>

                    <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm leading-relaxed">
                        InkHaven is 100% free to use. To cover our server limits, we display clean, non-intrusive ads.
                        <br /><br />
                        Please <strong>disable your ad blocker</strong> to continue, or support us by upgrading to the Ad-Free Premium Sanctuary.
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-medium transition-all"
                        >
                            <RefreshCw size={18} />
                            I've disabled it, refresh page
                        </button>

                        <Link
                            href="/premium"
                            className="w-full flex items-center justify-center bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-900 dark:text-white py-3 rounded-xl font-medium transition-all border border-slate-200 dark:border-white/10"
                        >
                            Get Ad-Free Premium
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
