'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '../../stores/useSessionStore';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import AuraSphere from '../../components/Profile/AuraSphere';
import { useToast } from '../../components/ui/toast';
import { Loader2, Users, ShieldCheck, Sparkles, Activity } from 'lucide-react';

export default function QuickMatchPage() {
  const router = useRouter();
  const { session } = useSessionStore();
  const [status, setStatus] = useState<'idle' | 'searching' | 'matched' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const toast = useToast();

  const hasStarted = React.useRef(false);

  // Auto-start Quick Match
  useEffect(() => {
    if (!hasStarted.current) {
      hasStarted.current = true;
      // We need to defer execution slightly to ensure handleQuickMatch is ready
      setTimeout(() => {
        handleQuickMatch();
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Realtime Subscription for "Waiting" users
  useEffect(() => {
    if (status !== 'searching' || !session.userId) return;

    const channel = supabase
      .channel(`quick-match-${session.userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'room_participants',
          filter: `user_id=eq.${session.userId}`
        },
        (payload) => {
          setStatus('matched');
          toast.success('Match found! Connecting you now...');
          setTimeout(() => {
            router.push(`/chat/${payload.new.room_id}`);
          }, 1500);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [status, session.userId, router, toast]);

  const handleQuickMatch = async () => {
    try {
      setStatus('searching');
      setErrorMsg('');

      // Get auth token from Supabase session
      const { data: sessionData } = await supabase.auth.getSession();
      let token = sessionData?.session?.access_token ?? null;

      if (!token) {
        const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
        if (anonError) throw anonError;
        token = anonData.session?.access_token ?? null;
        const userId = anonData.user?.id ?? session.userId;
        useSessionStore.getState().setSession({ ...session, userId });
      }

      if (!token) {
        throw new Error('Unable to authenticate. Please try refreshing the page.');
      }

      const res = await fetch('/api/quick-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.message || `Failed to join queue: ${res.statusText}`);
      }

      const data = await res.json();

      if (data.data.matchFound && data.data.roomId) {
        setStatus('matched');
        toast.success('Match found! Connecting you now...');
        router.push(`/chat/${data.data.roomId}`);
      }
    } catch (err: any) {
      console.error('Quick Match Error:', err);
      setStatus('error');
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
      toast.error(err.message || 'Something went wrong.');
    }
  };

  if (!session.userId) {
    return <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
    </div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">

      {/* Background aura glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-md w-full text-center space-y-8">

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Quick Match
          </h1>
          <p className="text-white/50">
            Instantly connect with someone available now.
          </p>
        </div>

        {/* Main Action Area */}
        <div className="py-12 flex flex-col items-center justify-center min-h-[400px]">
          {status === 'idle' && (
            <div className="flex flex-col items-center">
              <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mb-4" />
              <p className="text-white/50 text-lg">Initializing connection...</p>
            </div>
          )}

          {status === 'searching' && (
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-700">
              {/* Pulsing Aura during search */}
              <div className="relative mb-12">
                <AuraSphere inkId={session.inkId || 'fallback'} size="lg" isPulsing={true} comfortLevel={session.comfortLevel as any} />

                {/* Orbiting Search Ring */}
                <div className="absolute inset-[-20%] rounded-full border border-dashed border-indigo-500/50 animate-[spin_4s_linear_infinite]" />
                <div className="absolute inset-[-30%] rounded-full border border-purple-500/20 animate-[spin_8s_linear_infinite_reverse]" />
              </div>

              <div className="text-center">
                <p className="text-xl font-medium text-white tracking-widest uppercase flex items-center gap-3">
                  <Activity className="w-5 h-5 text-indigo-400 animate-pulse" />
                  Scanning Frequencies
                </p>
                <p className="text-sm text-white/40 mt-2 font-mono">Calibrating matching vectors...</p>
              </div>
            </div>
          )}

          {/* Vibe Check Limbo State */}
          {status === 'matched' && (
            <div className="flex flex-col items-center w-full animate-in slide-in-from-bottom-10 fade-in duration-1000">
              <div className="text-center mb-10">
                <p className="text-sm font-mono text-emerald-400 mb-2 tracking-widest uppercase">Signal Locked</p>
                <h2 className="text-3xl font-bold text-white">Vibe Check</h2>
                <p className="text-white/50 text-sm mt-2">A connection is forming. Prepare your energy.</p>
              </div>

              <div className="flex items-center justify-center gap-8 w-full">
                {/* User's Aura */}
                <div className="flex flex-col items-center">
                  <AuraSphere inkId={session.inkId || 'fallback'} size="md" />
                  <span className="text-xs text-white/40 mt-4 font-mono">YOU</span>
                </div>

                {/* The Spark / Connection Line */}
                <div className="relative flex-1 max-w-[100px] h-[2px] bg-white/10">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 animate-[shimmer_2s_infinite]" style={{ backgroundSize: '200% 100%' }} />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-obsidian-900 border border-white/20 rounded-full p-2">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Partner's Aura (Mysterious fallback since inkId isn't known until channel connects) */}
                <div className="flex flex-col items-center">
                  <AuraSphere inkId="mysterious_stranger" size="md" comfortLevel="bold" isPulsing={true} />
                  <span className="text-xs text-white/40 mt-4 font-mono tracking-widest">UNKNOWN</span>
                </div>
              </div>

              <div className="mt-12 bg-white/5 px-6 py-3 rounded-full border border-white/10 flex items-center gap-3 backdrop-blur-md">
                <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                <span className="text-sm text-white font-medium">Establishing Secure WebRTC Tunnel...</span>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center animate-in zoom-in-95 duration-300">
              <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl mb-6 backdrop-blur-md">
                <p className="text-red-400 font-medium mb-2">Connection Severed</p>
                <p className="text-sm text-white/50">{errorMsg}</p>
              </div>
              <Button onClick={() => setStatus('idle')} variant="secondary" className="px-8">Recalibrate & Retry</Button>
            </div>
          )}
        </div>

        {/* Features / Reassurance */}
        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto pt-8 border-t border-white/5">
          <div className="flex flex-col items-center glass-panel p-4">
            <ShieldCheck className="w-6 h-6 text-indigo-400 mb-2" />
            <span className="text-xs text-white/60 font-medium tracking-wide">ZERO DATA RETAINED</span>
          </div>
          <div className="flex flex-col items-center glass-panel p-4">
            <Users className="w-6 h-6 text-purple-400 mb-2" />
            <span className="text-xs text-white/60 font-medium tracking-wide">ANONYMOUS P2P</span>
          </div>
        </div>
      </div>
    </div>
  );
}
