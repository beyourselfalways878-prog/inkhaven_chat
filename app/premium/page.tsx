"use client";

import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, Heart, Crown, Loader2 } from 'lucide-react';
import { useSessionStore } from '../../stores/useSessionStore';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { AuraBlendBackground } from '../../components/InkAura';

export default function PremiumPage() {
    const { session, setSession } = useSessionStore();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Require an actual registered account (not just anonymous)
    const isAnonymous = !session.userId || session.userId.startsWith('guest');

    useEffect(() => {
        // Load PayPal SDK script
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`;
        script.async = true;

        script.onload = () => {
            // @ts-ignore
            if (window.paypal) {
                // @ts-ignore
                window.paypal.Buttons({
                    createOrder: async () => {
                        const res = await fetch('/api/payments/paypal/create-order', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ userId: session.userId })
                        });
                        const data = await res.json();
                        return data.id;
                    },
                    onApprove: async (data: any) => {
                        setLoading(true);
                        const res = await fetch('/api/payments/paypal/capture-order', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ orderID: data.orderID })
                        });
                        if (res.ok) {
                            setSession({ ...session, isPremium: true });
                            router.push('/chat/lobby');
                        } else {
                            setError("Payment capture failed. Please contact support.");
                            setLoading(false);
                        }
                    }
                }).render('#paypal-button-container');
            }
        };

        document.body.appendChild(script);

        // Load Razorpay Script
        const rzScript = document.createElement('script');
        rzScript.src = 'https://checkout.razorpay.com/v1/checkout.js';
        rzScript.async = true;
        document.body.appendChild(rzScript);

        return () => {
            document.body.removeChild(script);
            document.body.removeChild(rzScript);
        };
    }, [session, setSession, router]);

    const handleRazorpay = async () => {
        if (isAnonymous) {
            setError("Please create a permanent account first to save your premium status.");
            setTimeout(() => router.push('/onboarding'), 2000);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/payments/razorpay/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: session.userId })
            });
            const order = await res.json();

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "InkHaven",
                description: "Lifetime Ad-Free Supporter",
                order_id: order.id,
                handler: function () {
                    // The webhook handles the actual database update securely.
                    // We can optimisticly update the client here.
                    setSession({ ...session, isPremium: true });
                    router.push('/chat/lobby');
                },
                theme: {
                    color: "#6366f1"
                }
            };

            // @ts-ignore
            const rzp1 = new window.Razorpay(options);
            rzp1.open();
        } catch (err) {
            setError("Failed to initialize Razorpay checkout.");
        } finally {
            setLoading(false);
        }
    };

    if (session.isPremium) {
        return (
            <AuraBlendBackground seed1={100} rep1={100} intensity={20} className="min-h-screen flex items-center justify-center p-6">
                <div className="max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Crown className="w-10 h-10 text-indigo-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">You are a Premium Supporter</h1>
                    <p className="text-slate-600 dark:text-slate-300">Thank you for supporting InkHaven and helping keep this sanctuary alive.</p>
                    <button onClick={() => router.push('/')} className="mt-8 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl font-medium">Return Home</button>
                </div>
            </AuraBlendBackground>
        );
    }

    return (
        <div className="container mx-auto px-6 py-12 md:py-20 flex justify-center min-h-[80vh]">
            <div className="max-w-lg w-full">

                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm font-medium mb-4">
                        <Crown size={16} /> InkHaven Lifetime Supporter
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
                        Become a Sanctuary Keeper
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-300">
                        InkHaven is 100% free. We use non-intrusive ads to keep the servers running. If you'd rather not see ads, you can support us directly.
                    </p>
                </div>

                <div className="bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-white/10 p-8 rounded-3xl shadow-xl relative overflow-hidden">

                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Heart size={120} />
                    </div>

                    <div className="mb-8">
                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-5xl font-extrabold text-slate-900 dark:text-white">₹499</span>
                            <span className="text-slate-500 dark:text-slate-400 font-medium mb-1">One-time payment</span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Equivalent to ~$9.99 USD internationally.</p>
                    </div>

                    <div className="space-y-4 mb-8 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                <ShieldCheck size={14} className="text-emerald-500" />
                            </div>
                            <span className="text-slate-700 dark:text-slate-200 font-medium">100% Ad-Free Experience Forever</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                                <Sparkles size={14} className="text-indigo-500" />
                            </div>
                            <span className="text-slate-700 dark:text-slate-200 font-medium">Unlock 3D WebGL Backgrounds (Galaxy, Rain)</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                                <Heart size={14} className="text-amber-500" />
                            </div>
                            <span className="text-slate-700 dark:text-slate-200 font-medium">Support the developers & keep the site alive</span>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-medium mb-6">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <button
                            onClick={handleRazorpay}
                            disabled={loading || isAnonymous}
                            className="w-full relative flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-medium transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Pay with Razorpay (India & Global)'}
                        </button>

                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-slate-200 dark:border-white/10"></div>
                            <span className="flex-shrink-0 mx-4 text-xs font-mono text-slate-400">OR</span>
                            <div className="flex-grow border-t border-slate-200 dark:border-white/10"></div>
                        </div>

                        {/* PayPal Button Container */}
                        <div id="paypal-button-container" className={`w-full ${isAnonymous ? 'opacity-50 pointer-events-none' : ''}`}></div>

                        {isAnonymous && (
                            <p className="text-center text-sm text-red-500 font-medium mt-4">
                                You must create a registered profile to upgrade to Premium.
                            </p>
                        )}

                    </div>

                </div>
            </div>
        </div>
    );
}
