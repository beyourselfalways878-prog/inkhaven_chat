"use client";
import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Fingerprint } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';

export default function AuthModal({ onClose }: { onClose: () => void }) {
    const [isLogin, setIsLogin] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!turnstileToken) {
            setError("Please complete the security check.");
            setLoading(false);
            return;
        }

        try {
            if (isForgotPassword) {
                const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/update-password`,
                });
                if (resetError) throw resetError;
                setSuccessMsg('A password reset link has been sent to your email.');
                setLoading(false);
                return;
            }

            if (isLogin) {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                    options: { captchaToken: turnstileToken }
                });
                if (signInError) throw signInError;
            } else {
                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { captchaToken: turnstileToken }
                });
                if (signUpError) throw signUpError;
            }
            onClose();
            window.location.reload();
        } catch (err: any) {
            setError(err.message || 'An error occurred during authentication.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/60 dark:bg-obsidian-950/80 backdrop-blur-md"
                onClick={onClose}
            />

            <div className="relative w-full max-w-sm card p-8 border border-slate-200 dark:border-white/5 animate-in fade-in zoom-in-95 duration-200">
                <div className="text-center mb-6">
                    <div className="mx-auto w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4">
                        <Fingerprint className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {isForgotPassword ? 'Reset Password' : (isLogin ? 'Welcome Back' : 'Claim Your Identity')}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-white/50 mt-1">
                        {isForgotPassword
                            ? 'Enter your email to receive a password reset link.'
                            : (isLogin
                                ? 'Enter your credentials to restore your persistent profile.'
                                : 'Register to claim your inkId and save your chat histories.')}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-white/70 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                            placeholder="vibe@inkhaven.in"
                            required
                        />
                    </div>

                    {!isForgotPassword && (
                        <div>
                            <label className="block text-xs font-medium text-slate-600 dark:text-white/70 mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                            {isLogin && (
                                <div className="mt-2 text-right">
                                    <button
                                        type="button"
                                        onClick={() => { setIsForgotPassword(true); setError(''); setSuccessMsg(''); }}
                                        className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {error && (
                        <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3">
                            {error}
                        </div>
                    )}

                    {successMsg && (
                        <div className="text-sm text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-lg p-3">
                            {successMsg}
                        </div>
                    )}

                    <div className="flex justify-center min-h-[65px]">
                        <Turnstile
                            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                            onSuccess={setTurnstileToken}
                            options={{ theme: 'dark' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !turnstileToken}
                        className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white text-sm font-medium transition-colors flex items-center justify-center disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            isForgotPassword ? 'Send Reset Link' : (isLogin ? 'Sign In' : 'Register Identity')
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    {isForgotPassword ? (
                        <button
                            onClick={() => { setIsForgotPassword(false); setError(''); setSuccessMsg(''); }}
                            className="text-xs text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white/80 transition-colors"
                        >
                            Remembered your password? Sign in.
                        </button>
                    ) : (
                        <button
                            onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMsg(''); }}
                            className="text-xs text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white/80 transition-colors"
                        >
                            {isLogin
                                ? "Don't have an account? Register instead."
                                : "Already have an identity? Sign in."}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
