"use client";

import Script from 'next/script';
import { useSessionStore } from '../stores/useSessionStore';

export default function DynamicAdSense() {
    const isPremium = useSessionStore((s) => s.session.isPremium);

    // If the user has a premium subscription, never load the ad-network
    if (isPremium) {
        return null;
    }

    return (
        <Script
            id="adsbygoogle-init"
            strategy="afterInteractive"
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7229649791586904"
            crossOrigin="anonymous"
        />
    );
}
