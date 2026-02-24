'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Turnstile } from '@marsidev/react-turnstile';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { useToast } from '../../components/ui/toast';

export default function VerifyPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const toast = useToast();

    const [verifying, setVerifying] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleVerify = async (token: string) => {
        setVerifying(true);
        setErrorMsg('');

        try {
            // Introduce a timeout so it doesn't spin forever if the network hangs
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            const res = await fetch('/api/verify-turnstile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            const data = await res.json();

            if (data.success) {
                // Successfully verified, redirect to original destination or home
                const redirectTo = searchParams.get('redirect') || '/';
                router.push(redirectTo);
                toast.success('Security check passed.');
            } else {
                setErrorMsg(data.error || 'Verification failed. Please try again.');
                setVerifying(false); // Reset to allow them to try again, although turnstile widget might need a reset
            }
        } catch (err: any) {
            if (err.name === 'AbortError') {
                setErrorMsg('Verification request timed out. Please check your connection and try again.');
            } else {
                setErrorMsg('Network error. Please check your connection and try again.');
            }
            setVerifying(false);
        }
    };

    if (!mounted) return null; // Prevent hydration errors

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-slate-50 dark:bg-obsidian-950">
            {/* Background aesthetics */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="relative z-10 max-w-sm w-full text-center space-y-8 glass p-8 rounded-3xl border border-slate-200 dark:border-white/5 shadow-2xl">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                        <ShieldCheck className="w-8 h-8 text-indigo-500" />
                    </div>
                </div>

                <div className="space-y-3">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Security Check</h1>
                    <p className="text-sm text-slate-500 dark:text-white/60">
                        InkHaven is verifying your connection to ensure a safe environment for everyone.
                    </p>
                </div>

                <div className="flex flex-col items-center justify-center min-h-[100px] bg-slate-100 dark:bg-black/20 rounded-2xl border border-slate-200 dark:border-white/5 p-4">
                    {verifying ? (
                        <div className="flex flex-col items-center space-y-3">
                            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                            <span className="text-xs text-slate-500 dark:text-white/50 font-medium">Validating clearance...</span>
                        </div>
                    ) : (
                        <>
                            <div className="w-full flex flex-col items-center justify-center min-h-[65px] gap-2">
                                <Turnstile
                                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
                                    onSuccess={handleVerify}
                                    onError={() => setErrorMsg('Widget failed to load. Please disable extreme privacy shields or adblockers for this site.')}
                                    onExpire={() => setErrorMsg('Security challenge expired. Please refresh the page.')}
                                    options={{ theme: 'auto' }}
                                />
                                {errorMsg && errorMsg.includes('Widget failed') && (
                                    <span className="text-xs text-slate-500 max-w-xs text-center mt-2">
                                        Cloudflare Turnstile requires access to its verification servers. Strict tracker prevention can sometimes block it.
                                    </span>
                                )}
                            </div>
                            {process.env.NODE_ENV === 'development' && (
                                <button
                                    onClick={() => handleVerify('dummy_dev_token')}
                                    className="mt-4 px-4 py-2 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-white rounded-lg text-xs font-medium w-full transition"
                                >
                                    🔧 Dev Bypass
                                </button>
                            )}
                        </>
                    )}
                </div>

                {errorMsg && (
                    <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                        {errorMsg}
                    </div>
                )}
            </div>

            <div className="mt-8 text-xs text-slate-400 dark:text-white/30 font-medium tracking-wide flex items-center gap-2">
                <ShieldCheck className="w-3 h-3" />
                PROTECTED BY CLOUDFLARE
            </div>
        </div>
    );
}
