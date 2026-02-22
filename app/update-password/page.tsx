"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { Loader2, KeyRound } from 'lucide-react';
import { useToast } from '../../components/ui/toast';

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);
    const router = useRouter();
    const toast = useToast();

    // Verify session when landing on page (Supabase auto-parses the hash from the email link)
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                toast.error("Invalid or expired reset link. Please request a new one.");
                router.push('/');
            } else {
                setAuthChecked(true);
            }
        };
        checkSession();
    }, [router, toast]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            toast.success("Password updated successfully! Redirecting...");
            setTimeout(() => {
                router.push('/');
            }, 1500);
        } catch (err: any) {
            toast.error(err.message || "Failed to update password.");
        } finally {
            setLoading(false);
        }
    };

    if (!authChecked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-obsidian-950">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-obsidian-950 p-4">
            <div className="w-full max-w-md card p-8 border border-white/5 animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center mb-6">
                    <div className="mx-auto w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                        <KeyRound className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Reset Password</h2>
                    <p className="text-sm text-white/50 mt-1">Enter your new secure password below.</p>
                </div>

                <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-white/70 mb-1">New Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-white/70 mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !password || !confirmPassword}
                        className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white text-sm font-bold transition-all flex items-center justify-center disabled:opacity-50 mt-6"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save New Password'}
                    </button>

                    <div className="text-center mt-4">
                        <button
                            type="button"
                            onClick={() => router.push('/')}
                            className="text-xs text-white/30 hover:text-white/60 transition-colors"
                        >
                            Cancel and return to home
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
