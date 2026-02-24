'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '../stores/useSessionStore';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

export default function RequireProfile({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const session = useSessionStore((s) => s.session);
    const setSession = useSessionStore((s) => s.setSession);
    const [isVerifying, setIsVerifying] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function verifyProfile() {
            try {
                // If we already have a displayName in local state, we're good to go.
                if (session.displayName) {
                    if (mounted) setIsVerifying(false);
                    return;
                }

                // Check if there is an active Supabase session
                const { data: { session: authSession } } = await supabase.auth.getSession();

                if (!authSession) {
                    // No auth session at all, definitely need onboarding
                    if (mounted) router.push('/onboarding');
                    return;
                }

                // We have a user! Let's check their database profile.
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('display_name, ink_id, interests, comfort_level, reputation, is_premium')
                    .eq('id', authSession.user.id)
                    .single();

                if (error || !profile?.display_name) {
                    // Profile not found or display_name is null -> Needs onboarding
                    if (mounted) router.replace('/onboarding');
                    return;
                }

                // Profile is valid, populate the local store
                setSession({
                    ...session,
                    userId: authSession.user.id,
                    inkId: profile.ink_id,
                    displayName: profile.display_name,
                    interests: profile.interests || [],
                    comfortLevel: profile.comfort_level,
                    reputation: profile.reputation,
                    isPremium: profile.is_premium
                });

                if (mounted) setIsVerifying(false);

            } catch (err) {
                console.error('Failed to verify profile status:', err);
                if (mounted) router.replace('/onboarding');
            }
        }

        verifyProfile();

        return () => {
            mounted = false;
        };
    }, [session.displayName, router, setSession, session]);

    if (isVerifying) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return <>{children}</>;
}
