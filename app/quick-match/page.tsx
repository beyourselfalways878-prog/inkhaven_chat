'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '../../stores/useSessionStore';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { InkAura, ChemistryMeter } from '../../components/InkAura';
import { useToast } from '../../components/ui/toast';
import { Loader2, Zap, Users, ShieldCheck, Sparkles } from 'lucide-react';

export default function QuickMatchPage() {
  const router = useRouter();
  const { session } = useSessionStore();
  const [status, setStatus] = useState<'idle' | 'searching' | 'matched' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const toast = useToast();

  const auraSeed = session.auraSeed ?? 42;
  const reputation = session.reputation ?? 50;

  // 1. Auth Check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!session.userId) {
        router.push('/onboarding');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [session, router]);

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
        <div className="py-12 flex flex-col items-center justify-center">
          {status === 'idle' && (
            <div className="relative group">
              {/* InkAura orb behind the button */}
              <div className="absolute inset-0 flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity">
                <InkAura seed={auraSeed} reputation={reputation} size="lg" />
              </div>
              <button
                onClick={handleQuickMatch}
                className="relative w-48 h-48 rounded-full bg-slate-900/80 backdrop-blur-sm border-2 border-white/10 flex flex-col items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 z-10"
              >
                <Zap className="w-16 h-16 text-indigo-400 mb-2 fill-current" />
                <span className="font-bold text-lg text-white">Tap to Match</span>
              </button>
            </div>
          )}

          {status === 'searching' && (
            <div className="flex flex-col items-center">
              {/* Pulsing InkAura during search */}
              <div className="relative w-48 h-48 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                  <InkAura seed={auraSeed} reputation={reputation} size="lg" />
                </div>
                <div className="relative z-10 bg-slate-900/80 backdrop-blur-sm w-28 h-28 rounded-full flex items-center justify-center border border-white/10">
                  <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
                </div>
              </div>
              <div className="mt-8 text-center">
                <p className="text-lg font-medium text-white animate-pulse">Searching...</p>
                <p className="text-sm text-white/40 mt-1">Finding your ink-compatible match</p>
              </div>
            </div>
          )}

          {status === 'matched' && (
            <div className="flex flex-col items-center">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
                <div className="bg-slate-900/80 w-32 h-32 rounded-full flex flex-col items-center justify-center border-2 border-emerald-500 shadow-lg shadow-emerald-500/20">
                  <Sparkles className="w-10 h-10 text-emerald-400 mb-1" />
                  <Users className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
              <div className="mt-8">
                <p className="text-lg font-bold text-emerald-400">Match Found!</p>
                <p className="text-sm text-white/40 mt-1">Redirecting to chat...</p>
                {/* Show chemistry meter for matched state */}
                <div className="mt-4">
                  <ChemistryMeter seed1={auraSeed} seed2={777} />
                </div>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl mb-6">
                <p className="text-red-400 font-medium mb-2">Oops!</p>
                <p className="text-sm text-white/50">{errorMsg}</p>
              </div>
              <Button onClick={() => setStatus('idle')} variant="secondary">Try Again</Button>
            </div>
          )}
        </div>

        {/* Features / Reassurance */}
        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto pt-8 border-t border-white/5">
          <div className="flex flex-col items-center">
            <ShieldCheck className="w-6 h-6 text-emerald-400 mb-2" />
            <span className="text-xs text-white/40 font-medium">Verified Privacy</span>
          </div>
          <div className="flex flex-col items-center">
            <Users className="w-6 h-6 text-blue-400 mb-2" />
            <span className="text-xs text-white/40 font-medium">Real People Only</span>
          </div>
        </div>
      </div>
    </div>
  );
}
